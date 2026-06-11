"use client";

import { useFeatureFlags } from "@/lib/hooks/use-feature-flags";
import type { FeatureFlagKey } from "@/lib/feature-flags";
import { FeatureUpgradeScreen } from "@/components/feature-modules/feature-upgrade-screen";

export function FeatureGate({
  flag,
  title,
  children,
}: {
  flag: FeatureFlagKey;
  title: string;
  children: React.ReactNode;
}) {
  const { isEnabled, isLoading } = useFeatureFlags();
  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!isEnabled(flag)) {
    return <FeatureUpgradeScreen title={title} flag={flag} />;
  }
  return <>{children}</>;
}
