import { prisma } from "@sangam/db";
import { ForbiddenError } from "@sangam/api-kit";
import { FEATURE_FLAG_LABELS } from "@sangam/contracts";
import type { FeatureFlagKey, FeatureFlagsMap } from "@sangam/contracts";

function flagsEnforceEnabled(): boolean {
  return (process.env.FEATURE_FLAGS_ENFORCE ?? "true").toLowerCase() !== "false";
}

function readFlagsFromSettings(settings: unknown): FeatureFlagsMap {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) return {};
  const root = settings as Record<string, unknown>;
  const saas = root.saasTenant;
  if (!saas || typeof saas !== "object" || Array.isArray(saas)) return {};
  const ff = (saas as Record<string, unknown>).featureFlags;
  if (!ff || typeof ff !== "object" || Array.isArray(ff)) return {};
  const out: FeatureFlagsMap = {};
  for (const [k, v] of Object.entries(ff)) {
    if (v === true) out[k as FeatureFlagKey] = true;
  }
  return out;
}

export async function getTenantFeatureFlags(tenantId: string): Promise<FeatureFlagsMap> {
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: { settings: true },
  });
  if (!tenant) return {};
  return readFlagsFromSettings(tenant.settings);
}

export function isFeatureEnabledFromSettings(
  settings: unknown,
  flag: FeatureFlagKey,
): boolean {
  if (!flagsEnforceEnabled()) return false;
  const flags = readFlagsFromSettings(settings);
  return flags[flag] === true;
}

export async function isFeatureEnabled(
  tenantId: string,
  flag: FeatureFlagKey,
): Promise<boolean> {
  if (!flagsEnforceEnabled()) return false;
  const flags = await getTenantFeatureFlags(tenantId);
  return flags[flag] === true;
}

/** Throws when flag is off — use on add-on module routes. */
export async function requireFeature(
  tenantId: string,
  flag: FeatureFlagKey,
): Promise<void> {
  const on = await isFeatureEnabled(tenantId, flag);
  if (!on) {
    const label = FEATURE_FLAG_LABELS[flag] ?? flag;
    throw new ForbiddenError(
      `The "${label}" module is not included in your workspace. Contact Vetan support to upgrade.`,
    );
  }
}
