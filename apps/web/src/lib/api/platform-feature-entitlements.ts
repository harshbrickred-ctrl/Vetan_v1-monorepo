import { apiFetchJson } from "./client";
import type { FeatureFlagsMap } from "@/lib/feature-flags";

export type FeatureCatalogEntry = {
  key: string;
  label: string;
  tier: number;
  monthlyPriceInr: number;
  defaultEnabled: boolean;
};

export type PlatformFeatureEntitlements = {
  tenantId: string;
  slug: string;
  name: string;
  flags: FeatureFlagsMap;
  catalog: FeatureCatalogEntry[];
  monthlyFeeInr: number;
  defaultFlags: FeatureFlagsMap;
};

export async function fetchPlatformTenantFeatureEntitlements(
  token: string,
  tenantId: string,
) {
  return apiFetchJson<PlatformFeatureEntitlements>(
    `/v1/platform/tenants/${tenantId}/feature-entitlements`,
    { method: "GET", token },
  );
}

export async function patchPlatformTenantFeatureEntitlements(
  token: string,
  tenantId: string,
  featureFlags: FeatureFlagsMap,
) {
  return apiFetchJson<{
    tenantId: string;
    flags: FeatureFlagsMap;
    monthlyFeeInr: number;
    catalog: FeatureCatalogEntry[];
  }>(`/v1/platform/tenants/${tenantId}/feature-entitlements`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ featureFlags }),
  });
}
