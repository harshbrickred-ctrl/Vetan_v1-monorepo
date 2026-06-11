import type { FeatureFlagsMap } from "@sangam/contracts";
import { apiFetchJson } from "./client";

export async function fetchTenantFeatureFlags(token: string): Promise<FeatureFlagsMap> {
  return apiFetchJson<FeatureFlagsMap>("/v1/tenant/feature-flags", {
    method: "GET",
    token,
  });
}
