import { createHash, randomBytes } from "crypto";
import { prisma, EmployeeOnboardingDocumentType as EODT } from "@sangam/db";
import { BadRequestError, NotFoundError } from "@sangam/api-kit";
import { hashIntegrationKey } from "./integration-auth";
import * as onboardingDocs from "../employees/onboarding-documents-service";

type TenantSettings = {
  integrations?: {
    idCardPortal?: {
      apiKeyHash?: string;
      apiKeyPrefix?: string;
      createdAt?: string;
      createdByUserId?: string;
    };
  };
};

function getApiBaseUrl(): string {
  return (
    process.env.FRONTEND_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export async function getIntegrationStatus(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new NotFoundError("Tenant not found");
  const settings = (tenant.settings ?? {}) as TenantSettings;
  const idCard = settings.integrations?.idCardPortal;
  return {
    configured: Boolean(idCard?.apiKeyHash),
    apiKeyPrefix: idCard?.apiKeyPrefix ?? null,
    createdAt: idCard?.createdAt ?? null,
  };
}

export async function generateIntegrationApiKey(tenantId: string, userId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new NotFoundError("Tenant not found");

  const raw = `vic_${randomBytes(24).toString("base64url")}`;
  const hash = hashIntegrationKey(raw);
  const prefix = raw.slice(0, 12);

  const settings = (tenant.settings ?? {}) as Record<string, unknown>;
  const integrations = (settings.integrations ?? {}) as Record<string, unknown>;
  settings.integrations = {
    ...integrations,
    idCardPortal: {
      apiKeyHash: hash,
      apiKeyPrefix: prefix,
      createdAt: new Date().toISOString(),
      createdByUserId: userId,
    },
  };

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { settings: settings as object },
  });

  return { apiKey: raw, apiKeyPrefix: prefix };
}

export async function revokeIntegrationApiKey(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new NotFoundError("Tenant not found");
  const settings = (tenant.settings ?? {}) as Record<string, unknown>;
  const integrations = (settings.integrations ?? {}) as Record<string, unknown>;
  delete integrations.idCardPortal;
  settings.integrations = integrations;
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { settings: settings as object },
  });
}

async function photoUrlForEmployee(
  tenantId: string,
  employeeId: string,
  apiKey: string,
): Promise<string | null> {
  const photo = await prisma.employeeOnboardingDocument.findFirst({
    where: { tenantId, employeeId, documentType: EODT.PHOTOGRAPH },
    orderBy: { createdAt: "desc" },
    select: { id: true },
  });
  if (!photo) return null;
  const base = getApiBaseUrl();
  return `${base}/v1/integrations/id-cards/photos/${employeeId}?key=${encodeURIComponent(apiKey)}`;
}

export async function exportEmployeesForIdCards(tenantId: string, apiKey: string) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new NotFoundError("Tenant not found");

  const employees = await prisma.employee.findMany({
    where: { tenantId, deletedAt: null },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: 5000,
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      dateOfJoining: true,
      department: { select: { name: true } },
      designation: { select: { title: true } },
    },
  });

  const withPhotos = await Promise.all(
    employees.map(async (e) => ({
      externalId: e.id,
      employeeCode: e.employeeCode,
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email,
      department: e.department?.name ?? undefined,
      designation: e.designation?.title ?? undefined,
      status: e.status,
      dateOfJoining: e.dateOfJoining.toISOString().slice(0, 10),
      photoUrl: await photoUrlForEmployee(tenantId, e.id, apiKey),
    })),
  );

  return {
    schemaVersion: "1" as const,
    organization: {
      externalId: tenant.id,
      name: tenant.name,
      code: tenant.companyCode,
      logoUrl: null,
    },
    employees: withPhotos,
  };
}

export async function resolveEmployeePhoto(
  tenantId: string,
  employeeId: string,
  apiKeyFromQuery: string | null,
) {
  if (!apiKeyFromQuery?.startsWith("vic_")) {
    throw new BadRequestError("Missing photo access key");
  }
  const hash = createHash("sha256").update(apiKeyFromQuery).digest("hex");
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new NotFoundError("Tenant not found");
  const settings = (tenant.settings ?? {}) as TenantSettings;
  if (settings.integrations?.idCardPortal?.apiKeyHash !== hash) {
    throw new BadRequestError("Invalid photo access key");
  }

  const photo = await prisma.employeeOnboardingDocument.findFirst({
    where: { tenantId, employeeId, documentType: EODT.PHOTOGRAPH },
    orderBy: { createdAt: "desc" },
  });
  if (!photo) throw new NotFoundError("Photo not found");

  return onboardingDocs.resolveDownload(tenantId, employeeId, photo.id);
}
