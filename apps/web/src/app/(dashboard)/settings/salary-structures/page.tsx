"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { toast } from "sonner";

import { FeatureUpgradeScreen } from "@/components/feature-modules/feature-upgrade-screen";
import { GlassCard } from "@/components/ui/glass-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import {
  deleteSalaryStructure,
  fetchSalaryStructures,
} from "@/lib/api/salary-structures";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useFeatureFlags } from "@/lib/hooks/use-feature-flags";

export default function SalaryStructuresPage() {
  const token = useAuthStore((s) => s.token);
  const { isEnabled, isLoading: flagsLoading } = useFeatureFlags();
  const qc = useQueryClient();
  const enabled = isEnabled("salaryStructuresAdmin");

  const listQuery = useQuery({
    queryKey: ["salary-structures", token],
    queryFn: () => fetchSalaryStructures(token!),
    enabled: !!token && enabled,
  });

  if (flagsLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!enabled) {
    return <FeatureUpgradeScreen title="Salary structures" flag="salaryStructuresAdmin" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
            Salary structures
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Bundle components into reusable salary templates for employee assignments.
          </p>
        </div>
        <Link href="/settings/salary-structures/new" className={buttonVariants()}>
          Create structure
        </Link>
      </div>

      <GlassCard level={2} className="overflow-hidden p-0">
        {listQuery.isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading…</p>
        ) : (listQuery.data ?? []).length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">
            No structures yet. Create components first, then build a structure.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Components</th>
                <th className="px-4 py-3 text-left">Published</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(listQuery.data ?? []).map((row) => (
                <tr key={row.id} className="border-b border-border/60">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">{row.components.length}</td>
                  <td className="px-4 py-3">{row.isPublished ? "Yes" : "Draft"}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        void deleteSalaryStructure(token!, row.id)
                          .then(() => {
                            toast.success("Archived");
                            void qc.invalidateQueries({ queryKey: ["salary-structures"] });
                          })
                          .catch((e) =>
                            toast.error(e instanceof ApiError ? e.message : "Failed"),
                          );
                      }}
                    >
                      Archive
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </div>
  );
}
