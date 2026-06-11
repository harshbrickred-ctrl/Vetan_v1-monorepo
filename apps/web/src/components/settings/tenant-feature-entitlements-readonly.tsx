"use client";

import { useQuery } from "@tanstack/react-query";
import { IndianRupee, Lock, LockOpen } from "lucide-react";
import Link from "next/link";

import { GlassCard } from "@/components/ui/glass-card";
import { buttonVariants } from "@/components/ui/button";
import { fetchTenantFeatureFlags } from "@/lib/api/feature-flags";
import {
  FEATURE_FLAG_KEYS,
  FEATURE_FLAG_LABELS,
  type FeatureFlagKey,
} from "@/lib/feature-flags";
import { useAuthStore } from "@/lib/auth/auth-store";
import { cn } from "@/lib/utils";

export function TenantFeatureEntitlementsReadonly() {
  const token = useAuthStore((s) => s.token);
  const { data: flags = {}, isLoading } = useQuery({
    queryKey: ["tenant", "feature-flags", token],
    queryFn: () => fetchTenantFeatureFlags(token!),
    enabled: !!token,
  });

  const enabled = FEATURE_FLAG_KEYS.filter((k) => flags[k] === true);
  const locked = FEATURE_FLAG_KEYS.filter((k) => flags[k] !== true);

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Module entitlements are managed by Vetan platform administration. You can see all modules in
        the sidebar; locked modules prompt you to upgrade when opened.
      </p>
      {isLoading ? <p className="text-sm text-muted-foreground">Loading modules…</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard level={1} className="p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <LockOpen className="size-4 text-[var(--success-text)]" />
            Enabled ({enabled.length})
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            {enabled.length === 0 ? (
              <li className="text-muted-foreground">No add-on modules enabled yet.</li>
            ) : (
              enabled.map((key: FeatureFlagKey) => (
                <li key={key}>{FEATURE_FLAG_LABELS[key]}</li>
              ))
            )}
          </ul>
        </GlassCard>
        <GlassCard level={1} className="p-4">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Lock className="size-4 text-muted-foreground" />
            Not subscribed ({locked.length})
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Visible in navigation with upgrade prompt when accessed.
          </p>
        </GlassCard>
      </div>
      <Link href="/billing" className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}>
        <IndianRupee className="mr-1 size-3.5" />
        View billing summary
      </Link>
    </div>
  );
}
