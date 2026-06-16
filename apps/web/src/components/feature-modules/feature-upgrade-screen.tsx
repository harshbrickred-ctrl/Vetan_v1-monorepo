"use client";

import Link from "next/link";
import { Headphones, Lock } from "lucide-react";

import { GlassCard } from "@/components/ui/glass-card";
import { buttonVariants } from "@/components/ui/button";
import { FEATURE_FLAG_LABELS, type FeatureFlagKey } from "@/lib/feature-flags";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  flag?: FeatureFlagKey;
  featureLabel?: string;
  /** Admin sees subscription upgrade; employees see a neutral unavailable message. */
  audience?: "admin" | "employee";
};

export function FeatureUpgradeScreen({
  title,
  flag,
  featureLabel,
  audience = "admin",
}: Props) {
  const moduleName =
    featureLabel ?? (flag ? FEATURE_FLAG_LABELS[flag] : undefined) ?? title;

  if (audience === "employee") {
    return (
      <GlassCard level={2} className="mx-auto max-w-lg p-8 text-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This section is not available in your employee portal. If you believe you should have
          access, please contact your HR or workspace administrator.
        </p>
        <div className="mt-6">
          <Link
            href="/employee/dashboard"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            Back to home
          </Link>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard level={2} className="mx-auto max-w-lg p-8 text-center">
      <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--brand-500)_12%,transparent)]">
        <Lock className="size-5 text-[var(--brand-500)]" aria-hidden />
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        The <span className="font-medium text-foreground">{moduleName}</span> module is not part
        of your current subscription.
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        To opt in for these features, kindly reach out to us via the Support module — our team will
        enable the modules for your organization after confirmation.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link href="/support" className={cn(buttonVariants({ variant: "default" }), "gap-2")}>
          <Headphones className="size-4" />
          Contact support
        </Link>
        <Link href="/billing" className={cn(buttonVariants({ variant: "secondary" }))}>
          View billing
        </Link>
        <Link href="/" className={cn(buttonVariants({ variant: "ghost" }))}>
          Back to dashboard
        </Link>
      </div>
    </GlassCard>
  );
}
