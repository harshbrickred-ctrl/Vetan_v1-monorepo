import { prisma } from "@sangam/db";
import { NotFoundError } from "@sangam/api-kit";
import type { PolicyLibrary } from "@sangam/contracts";

function mapPolicy(row: {
  id: string;
  title: string;
  body: string;
  version: string;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    version: row.version,
    publishedAt: row.publishedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listPolicies(tenantId: string) {
  const rows = await prisma.policyDocument.findMany({
    where: { tenantId },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapPolicy);
}

export async function listPublishedForEmployee(tenantId: string, employeeId: string) {
  const rows = await prisma.policyDocument.findMany({
    where: { tenantId, publishedAt: { not: null } },
    orderBy: { title: "asc" },
    include: {
      acknowledgements: {
        where: { employeeId },
        select: { acknowledgedAt: true },
      },
    },
  });
  return rows.map((r) => ({
    ...mapPolicy(r),
    acknowledgedAt: r.acknowledgements[0]?.acknowledgedAt.toISOString() ?? null,
  }));
}

export async function createPolicy(tenantId: string, dto: PolicyLibrary.CreatePolicyDto) {
  const row = await prisma.policyDocument.create({
    data: {
      tenantId,
      title: dto.title.trim(),
      body: dto.body,
      version: dto.version ?? "1.0",
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
    },
  });
  return mapPolicy(row);
}

export async function updatePolicy(
  tenantId: string,
  id: string,
  dto: PolicyLibrary.UpdatePolicyDto,
) {
  const row = await prisma.policyDocument.findFirst({ where: { id, tenantId } });
  if (!row) throw new NotFoundError("Policy not found");
  const updated = await prisma.policyDocument.update({
    where: { id },
    data: {
      ...(dto.title !== undefined && { title: dto.title.trim() }),
      ...(dto.body !== undefined && { body: dto.body }),
      ...(dto.version !== undefined && { version: dto.version }),
      ...(dto.publishedAt !== undefined && {
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
      }),
    },
  });
  return mapPolicy(updated);
}

export async function deletePolicy(tenantId: string, id: string) {
  const row = await prisma.policyDocument.findFirst({ where: { id, tenantId } });
  if (!row) throw new NotFoundError("Policy not found");
  await prisma.policyDocument.delete({ where: { id } });
  return { deleted: true };
}

export async function acknowledgePolicy(
  tenantId: string,
  employeeId: string,
  policyId: string,
) {
  const policy = await prisma.policyDocument.findFirst({
    where: { id: policyId, tenantId, publishedAt: { not: null } },
  });
  if (!policy) throw new NotFoundError("Policy not found or not published");

  const ack = await prisma.policyAcknowledgement.upsert({
    where: { policyId_employeeId: { policyId, employeeId } },
    create: { policyId, employeeId },
    update: { acknowledgedAt: new Date() },
  });
  return { policyId, acknowledgedAt: ack.acknowledgedAt.toISOString() };
}
