"use client";

import Link from "next/link";

import { GlassCard } from "@/components/ui/glass-card";
import { useFeatureFlags } from "@/lib/hooks/use-feature-flags";
import type { FeatureFlagKey } from "@/lib/feature-flags";

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
    return (
      <GlassCard level={2} className="p-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enable this module in{" "}
          <Link href="/settings/workspace?tab=saas" className="text-[var(--brand-500)] underline">
            Workspace → SaaS → Feature modules
          </Link>
          .
        </p>
      </GlassCard>
    );
  }
  return <>{children}</>;
}
