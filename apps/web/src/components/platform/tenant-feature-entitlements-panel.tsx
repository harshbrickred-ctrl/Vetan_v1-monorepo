"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IndianRupee, Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { FeatureFlagsPanel } from "@/components/settings/feature-flags-panel";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ApiError } from "@/lib/api/client";
import {
  fetchPlatformTenantFeatureEntitlements,
  patchPlatformTenantFeatureEntitlements,
} from "@/lib/api/platform-feature-entitlements";
import type { FeatureFlagsMap } from "@/lib/feature-flags";
import { usePlatformAuthStore } from "@/lib/platform/auth-store";
import { formatCurrency } from "@/lib/utils/formatters";

export function TenantFeatureEntitlementsPanel({ tenantId }: { tenantId: string }) {
  const token = usePlatformAuthStore((s) => s.token);
  const qc = useQueryClient();
  const [flags, setFlags] = useState<FeatureFlagsMap>({});

  const query = useQuery({
    queryKey: ["platform", "tenant", tenantId, "feature-entitlements", token],
    queryFn: () => fetchPlatformTenantFeatureEntitlements(token!, tenantId),
    enabled: !!token && !!tenantId,
  });

  useEffect(() => {
    if (query.data?.flags) setFlags(query.data.flags);
  }, [query.data?.flags]);

  const save = useMutation({
    mutationFn: () => patchPlatformTenantFeatureEntitlements(token!, tenantId, flags),
    onSuccess: (data) => {
      toast.success("Feature entitlements updated");
      setFlags(data.flags);
      void qc.invalidateQueries({ queryKey: ["platform", "tenant", tenantId] });
      void qc.invalidateQueries({ queryKey: ["platform", "billing"] });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Could not save entitlements"),
  });

  const monthlyFee = query.data?.monthlyFeeInr ?? 0;

  return (
    <GlassCard level={2} className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Feature modules & billing</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Only platform super admin can enable or disable modules for this organization.
            Billing is calculated from enabled modules — the tenant sees all modules in navigation
            but locked modules show an upgrade screen.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-2 text-right">
          <p className="text-xs text-muted-foreground">Monthly subscription</p>
          <p className="flex items-center justify-end gap-1 text-lg font-semibold tabular-nums">
            <IndianRupee className="size-4" />
            {formatCurrency(monthlyFee).replace(/^₹\s?/, "")}
            <span className="text-xs font-normal text-muted-foreground">/ mo</span>
          </p>
        </div>
      </div>

      {query.isLoading ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading entitlements…
        </p>
      ) : null}

      {query.isError ? (
        <p className="mt-4 text-sm text-destructive">{(query.error as Error).message}</p>
      ) : null}

      {query.data ? (
        <div className="mt-4">
          <FeatureFlagsPanel
            flags={flags}
            onChange={setFlags}
            showPricing
            catalog={query.data.catalog}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              className="gap-2"
              disabled={save.isPending}
              onClick={() => save.mutate()}
            >
              {save.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save feature entitlements
            </Button>
          </div>
        </div>
      ) : null}
    </GlassCard>
  );
}
