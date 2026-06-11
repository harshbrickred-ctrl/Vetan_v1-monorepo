"use client";

import { useQuery } from "@tanstack/react-query";

import { isFlagOn, type FeatureFlagKey, type FeatureFlagsMap } from "@/lib/feature-flags";
import { fetchTenantFeatureFlags } from "@/lib/api/feature-flags";
import { useAuthStore } from "@/lib/auth/auth-store";

export function useFeatureFlags() {
  const token = useAuthStore((s) => s.token);
  const query = useQuery({
    queryKey: ["tenant", "feature-flags", token],
    queryFn: () => fetchTenantFeatureFlags(token!),
    enabled: !!token,
    staleTime: 60_000,
  });

  const flags: FeatureFlagsMap = query.data ?? {};

  return {
    flags,
    isLoading: query.isLoading,
    isEnabled: (key: FeatureFlagKey) => isFlagOn(flags, key),
  };
}
