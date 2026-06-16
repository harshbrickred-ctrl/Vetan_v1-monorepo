import { prisma } from "@sangam/db";
import { NotFoundError } from "@sangam/api-kit";
import type { PlatformSupport } from "@sangam/contracts";
import { email } from "@sangam/demo";

export type SupportConfig = {
  supportEmail: string;
  whatsappNumber: string | null;
  whatsappEnabled: boolean;
};

export function getSupportConfig(): SupportConfig {
  const raw = process.env.VETAN_SUPPORT_WHATSAPP?.trim() ?? "";
  const digits = raw.replace(/\D/g, "");
  return {
    supportEmail:
      process.env.VETAN_SUPPORT_EMAIL?.trim() || "support@vetan.app",
    whatsappNumber: digits || null,
    whatsappEnabled: digits.length >= 10,
  };
}

export function buildWhatsAppUrl(text: string): string | null {
  const { whatsappNumber } = getSupportConfig();
  if (!whatsappNumber) return null;
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
}

export function buildMailtoUrl(
  subject: string,
  body: string,
  to?: string,
): string {
  const emailTo = to ?? getSupportConfig().supportEmail;
  const q = new URLSearchParams({
    subject,
    body,
  });
  return `mailto:${emailTo}?${q.toString()}`;
}

function mapRow(row: {
  id: string;
  tenantId: string;
  userId: string | null;
  requesterRole: string;
  requesterName: string;
  requesterEmail: string;
  employeeId: string | null;
  subject: string;
  message: string;
  category: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  tenant?: { slug: string; name: string };
}) {
  return {
    id: row.id,
    tenantId: row.tenantId,
    tenantSlug: row.tenant?.slug ?? null,
    tenantName: row.tenant?.name ?? null,
    userId: row.userId,
    requesterRole: row.requesterRole,
    requesterName: row.requesterName,
    requesterEmail: row.requesterEmail,
    employeeId: row.employeeId,
    subject: row.subject,
    message: row.message,
    category: row.category,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function whatsAppBody(opts: {
  requestId: string;
  tenantName: string;
  tenantSlug: string;
  requesterName: string;
  requesterEmail: string;
  requesterRole: string;
  subject: string;
  message: string;
  category: string;
}) {
  return [
    "Hello Vetan Support,",
    "",
    `Request ID: ${opts.requestId}`,
    `Workspace: ${opts.tenantName} (${opts.tenantSlug})`,
    `From: ${opts.requesterName} (${opts.requesterRole})`,
    `Email: ${opts.requesterEmail}`,
    `Category: ${opts.category}`,
    `Subject: ${opts.subject}`,
    "",
    opts.message,
  ].join("\n");
}

async function notifySupportTeam(row: {
  id: string;
  subject: string;
  message: string;
  category: string;
  requesterName: string;
  requesterEmail: string;
  requesterRole: string;
  tenant: { name: string; slug: string };
}) {
  const config = getSupportConfig();
  const body = [
    `New support request #${row.id.slice(0, 8)}`,
    "",
    `Workspace: ${row.tenant.name} (${row.tenant.slug})`,
    `From: ${row.requesterName} <${row.requesterEmail}> (${row.requesterRole})`,
    `Category: ${row.category}`,
    "",
    row.message,
  ].join("\n");

  await email.send({
    to: config.supportEmail,
    subject: `[Vetan Support] ${row.subject}`,
    body,
    category: "platform-support",
    metadata: { requestId: row.id, tenantSlug: row.tenant.slug },
  });

  await email.send({
    to: row.requesterEmail,
    subject: `We received your request: ${row.subject}`,
    body: [
      `Hi ${row.requesterName},`,
      "",
      "Thank you for contacting Vetan support. We have received your request and will respond shortly.",
      "",
      `Reference: ${row.id}`,
      `Subject: ${row.subject}`,
      "",
      "You can also continue the conversation on WhatsApp if you opened the chat link.",
    ].join("\n"),
    category: "platform-support-confirmation",
  });
}

export async function createRequest(
  tenantId: string,
  user: {
    sub: string;
    email: string;
    employeeId?: string;
    roles: string[];
  },
  userName: string,
  dto: PlatformSupport.CreatePlatformSupportRequestDto,
) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, slug: true, name: true },
  });
  if (!tenant) throw new NotFoundError("Tenant not found");

  const isEmployee = user.roles.includes("EMPLOYEE") && !user.roles.includes("ADMIN");
  const requesterRole = isEmployee ? "EMPLOYEE" : "TENANT_ADMIN";

  const row = await prisma.platformSupportRequest.create({
    data: {
      tenantId,
      userId: user.sub,
      requesterRole,
      requesterName: userName.trim() || user.email,
      requesterEmail: user.email,
      employeeId: user.employeeId ?? null,
      subject: dto.subject.trim(),
      message: dto.message.trim(),
      category: dto.category ?? "GENERAL",
    },
    include: { tenant: { select: { slug: true, name: true } } },
  });

  await notifySupportTeam({
    id: row.id,
    subject: row.subject,
    message: row.message,
    category: row.category,
    requesterName: row.requesterName,
    requesterEmail: row.requesterEmail,
    requesterRole: row.requesterRole,
    tenant: row.tenant,
  });

  const waText = whatsAppBody({
    requestId: row.id,
    tenantName: tenant.name,
    tenantSlug: tenant.slug,
    requesterName: row.requesterName,
    requesterEmail: row.requesterEmail,
    requesterRole: row.requesterRole,
    subject: row.subject,
    message: row.message,
    category: row.category,
  });

  return {
    request: mapRow(row),
    whatsappUrl: buildWhatsAppUrl(waText),
    mailtoUrl: buildMailtoUrl(row.subject, waText),
    supportEmail: getSupportConfig().supportEmail,
  };
}

export async function listForTenant(tenantId: string, userId: string, isAdmin: boolean) {
  const rows = await prisma.platformSupportRequest.findMany({
    where: {
      tenantId,
      ...(isAdmin ? {} : { userId }),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { tenant: { select: { slug: true, name: true } } },
  });
  return rows.map(mapRow);
}

export async function listForPlatform(params?: {
  status?: string;
  tenantId?: string;
}) {
  const rows = await prisma.platformSupportRequest.findMany({
    where: {
      ...(params?.status ? { status: params.status } : {}),
      ...(params?.tenantId ? { tenantId: params.tenantId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { tenant: { select: { slug: true, name: true } } },
  });
  return rows.map(mapRow);
}

export async function updateStatus(
  id: string,
  dto: PlatformSupport.UpdatePlatformSupportStatusDto,
) {
  const row = await prisma.platformSupportRequest.findUnique({ where: { id } });
  if (!row) throw new NotFoundError("Support request not found");
  const updated = await prisma.platformSupportRequest.update({
    where: { id },
    data: { status: dto.status },
    include: { tenant: { select: { slug: true, name: true } } },
  });
  return mapRow(updated);
}

export async function countOpenForPlatform() {
  return prisma.platformSupportRequest.count({ where: { status: "OPEN" } });
}
