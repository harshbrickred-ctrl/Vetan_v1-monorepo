"use client";

import Link from "next/link";
import { Lock } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { buttonVariants } from "@/components/ui/button";
import { FEATURE_FLAG_LABELS, type FeatureFlagKey } from "@/lib/feature-flags";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  flag?: FeatureFlagKey;
  featureLabel?: string;
};

export function FeatureUpgradeScreen({ title, flag, featureLabel }: Props) {
  const moduleName =
    featureLabel ?? (flag ? FEATURE_FLAG_LABELS[flag] : undefined) ?? title;

  return (
    <GlassCard level={2} className="mx-auto max-w-lg p-8 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--brand-500)_12%,transparent)]">
        <Lock className="size-5 text-[var(--brand-500)]" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        The <span className="font-medium text-foreground">{moduleName}</span> module is not
        included in your workspace subscription.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        Please upgrade your portal to access this feature. Module entitlements are managed by
        Vetan platform administration — contact your account manager or review billing for your
        current plan.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/billing" className={cn(buttonVariants({ variant: "default" }))}>
          View billing & modules
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "secondary" }))}>
          Back to dashboard
        </Link>
      </div>
    </GlassCard>
  );
}
