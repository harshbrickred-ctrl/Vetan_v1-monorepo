import {
  FEATURE_FLAG_KEYS,
  FEATURE_FLAG_LABELS,
  FEATURE_MONTHLY_PRICE_INR,
  permissionRequiresFeature,
  type FeatureFlagKey,
  type FeatureFlagsMap,
} from "@sangam/contracts";

export {
  FEATURE_FLAG_KEYS,
  FEATURE_FLAG_LABELS,
  FEATURE_MONTHLY_PRICE_INR,
  permissionRequiresFeature,
  type FeatureFlagKey,
  type FeatureFlagsMap,
};

export function readFeatureFlagsFromTenantSettings(
  settings: Record<string, unknown> | undefined,
): FeatureFlagsMap {
  const saas = settings?.saasTenant;
  if (!saas || typeof saas !== "object" || Array.isArray(saas)) return {};
  const ff = (saas as Record<string, unknown>).featureFlags;
  if (!ff || typeof ff !== "object" || Array.isArray(ff)) return {};
  const out: FeatureFlagsMap = {};
  for (const key of FEATURE_FLAG_KEYS) {
    if ((ff as Record<string, unknown>)[key] === true) out[key] = true;
  }
  return out;
}

export function isFlagOn(flags: FeatureFlagsMap, key: FeatureFlagKey): boolean {
  return flags[key] === true;
}
