"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { FeatureUpgradeScreen } from "@/components/feature-modules/feature-upgrade-screen";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import {
  createSalaryComponent,
  deleteSalaryComponent,
  fetchSalaryComponents,
} from "@/lib/api/salary-components";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useFeatureFlags } from "@/lib/hooks/use-feature-flags";

const COMPONENT_TYPES = ["FIXED", "VARIABLE", "STATUTORY", "REIMBURSABLE"] as const;

export default function SalaryComponentsPage() {
  const token = useAuthStore((s) => s.token);
  const { isEnabled, isLoading: flagsLoading } = useFeatureFlags();
  const qc = useQueryClient();
  const enabled = isEnabled("salaryComponentsAdmin");

  const [name, setName] = useState("");
  const [type, setType] = useState<(typeof COMPONENT_TYPES)[number]>("FIXED");
  const [isTaxable, setIsTaxable] = useState(true);

  const listQuery = useQuery({
    queryKey: ["salary-components", token],
    queryFn: () => fetchSalaryComponents(token!),
    enabled: !!token && enabled,
  });

  const createMut = useMutation({
    mutationFn: () =>
      createSalaryComponent(token!, { name: name.trim(), type, isTaxable }),
    onSuccess: () => {
      toast.success("Component created");
      setName("");
      void qc.invalidateQueries({ queryKey: ["salary-components"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Failed"),
  });

  if (flagsLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!enabled) {
    return <FeatureUpgradeScreen title="Salary components" flag="salaryComponentsAdmin" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Salary components
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define basic, HRA, statutory and custom pay components used in salary structures.
        </p>
      </div>

      <GlassCard level={2} className="space-y-4 p-4">
        <h2 className="font-medium">Add component</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="scName">Name</Label>
            <Input
              id="scName"
              className="mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="House Rent Allowance"
            />
          </div>
          <div>
            <Label htmlFor="scType">Type</Label>
            <select
              id="scType"
              className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as (typeof COMPONENT_TYPES)[number])}
            >
              {COMPONENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2 pb-1">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={isTaxable}
                onChange={(e) => setIsTaxable(e.target.checked)}
              />
              Taxable
            </label>
          </div>
        </div>
        <Button
          type="button"
          disabled={!name.trim() || createMut.isPending}
          onClick={() => createMut.mutate()}
        >
          {createMut.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Add component
        </Button>
      </GlassCard>

      <GlassCard level={2} className="overflow-hidden p-0">
        {listQuery.isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Taxable</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(listQuery.data ?? []).map((row) => (
                <tr key={row.id} className="border-b border-border/60">
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{row.type}</td>
                  <td className="px-4 py-3">{row.isTaxable ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        void deleteSalaryComponent(token!, row.id)
                          .then(() => {
                            toast.success("Deleted");
                            void qc.invalidateQueries({ queryKey: ["salary-components"] });
                          })
                          .catch((e) =>
                            toast.error(e instanceof ApiError ? e.message : "Failed"),
                          );
                      }}
                    >
                      Delete
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
