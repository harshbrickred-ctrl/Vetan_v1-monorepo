import { prisma, type Prisma } from "@sangam/db";
import { BadRequestError, NotFoundError } from "@sangam/api-kit";
import {
  FEATURE_FLAG_KEYS,
  buildDefaultFeatureFlagsMap,
  listFeatureCatalog,
  type FeatureFlagKey,
  type FeatureFlagsMap,
} from "@sangam/contracts";
import { monthlyFeeFromFeatureFlags } from "@/server/billing/feature-billing";
import { estimateServerCostInr } from "@/server/platform/tenant-utils";
import { getTenantFeatureFlags } from "@/server/tenant/feature-flags";
import { deepMergeJson } from "@/server/shared/deep-merge";

function sanitizeFlags(input: FeatureFlagsMap): FeatureFlagsMap {
  const out: FeatureFlagsMap = {};
  for (const key of FEATURE_FLAG_KEYS) {
    if (input[key] === true) out[key] = true;
  }
  return out;
}

function readSaasTenant(settings: unknown): Record<string, unknown> {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) return {};
  const saas = (settings as Record<string, unknown>).saasTenant;
  if (!saas || typeof saas !== "object" || Array.isArray(saas)) return {};
  return saas as Record<string, unknown>;
}

async function syncBillingFee(tenantId: string, flags: FeatureFlagsMap) {
  const monthlyFeeInr = monthlyFeeFromFeatureFlags(flags);
  const employeeCount = await prisma.employee.count({
    where: { tenantId, deletedAt: null },
  });
  const monthlyServerCostInr = estimateServerCostInr(employeeCount);
  await prisma.tenantBillingOps.upsert({
    where: { tenantId },
    create: { tenantId, monthlyFeeInr, monthlyServerCostInr },
    update: { monthlyFeeInr },
  });
  return monthlyFeeInr;
}

export async function getTenantFeatureEntitlements(tenantId: string) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, slug: true, name: true, settings: true },
  });
  if (!tenant) throw new NotFoundError("Tenant not found");

  const flags = await getTenantFeatureFlags(tenantId);
  const catalog = listFeatureCatalog();
  const monthlyFeeInr = monthlyFeeFromFeatureFlags(flags);

  return {
    tenantId: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    flags,
    catalog,
    monthlyFeeInr,
    defaultFlags: buildDefaultFeatureFlagsMap(),
  };
}

export async function updateTenantFeatureEntitlements(
  tenantId: string,
  nextFlags: FeatureFlagsMap,
) {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { id: true, settings: true },
  });
  if (!tenant) throw new NotFoundError("Tenant not found");

  const flags = sanitizeFlags(nextFlags);
  const current =
    tenant.settings !== null &&
    typeof tenant.settings === "object" &&
    !Array.isArray(tenant.settings)
      ? (tenant.settings as Record<string, unknown>)
      : {};

  const saas = readSaasTenant(current);
  const merged = deepMergeJson(current, {
    saasTenant: {
      ...saas,
      featureFlags: flags,
    },
  });

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { settings: merged as Prisma.InputJsonValue },
  });

  const monthlyFeeInr = await syncBillingFee(tenantId, flags);

  return {
    tenantId,
    flags,
    monthlyFeeInr,
    catalog: listFeatureCatalog(),
  };
}

export function validateFeatureFlagKeys(flags: Record<string, unknown>) {
  for (const key of Object.keys(flags)) {
    if (!(FEATURE_FLAG_KEYS as readonly string[]).includes(key)) {
      throw new BadRequestError(`Unknown feature module: ${key}`);
    }
  }
}

export async function applyDefaultEntitlementsOnProvision(tenantId: string) {
  const defaults = buildDefaultFeatureFlagsMap();
  if (Object.keys(defaults).length === 0) return defaults;
  return updateTenantFeatureEntitlements(tenantId, defaults);
}
