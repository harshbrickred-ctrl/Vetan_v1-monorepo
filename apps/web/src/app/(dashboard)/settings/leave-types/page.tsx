"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import {
  createLeaveType,
  deleteLeaveType,
  fetchLeaveTypes,
} from "@/lib/api/leave-types";
import { useAuthStore } from "@/lib/auth/auth-store";
import { FeatureUpgradeScreen } from "@/components/feature-modules/feature-upgrade-screen";
import { useFeatureFlags } from "@/lib/hooks/use-feature-flags";

export default function LeaveTypesPage() {
  const token = useAuthStore((s) => s.token);
  const { isEnabled, isLoading: flagsLoading } = useFeatureFlags();
  const qc = useQueryClient();
  const enabled = isEnabled("leaveTypesAdmin");

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [days, setDays] = useState("12");
  const [carry, setCarry] = useState("");

  const listQuery = useQuery({
    queryKey: ["leave-types", token],
    queryFn: () => fetchLeaveTypes(token!),
    enabled: !!token && enabled,
  });

  const createMut = useMutation({
    mutationFn: () =>
      createLeaveType(token!, {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        daysPerYear: Number(days),
        ...(carry ? { carryForwardMax: Number(carry) } : {}),
      }),
    onSuccess: () => {
      toast.success("Leave type created");
      setCode("");
      setName("");
      void qc.invalidateQueries({ queryKey: ["leave-types"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Failed"),
  });

  if (flagsLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!enabled) {
    return <FeatureUpgradeScreen title="Leave types" flag="leaveTypesAdmin" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">Leave types</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure earned, sick, casual and custom leave types. Default types from onboarding remain
          editable.
        </p>
      </div>

      <GlassCard level={2} className="space-y-4 p-4">
        <h2 className="font-medium">Add leave type</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="ltCode">Code</Label>
            <Input id="ltCode" className="mt-1 font-mono uppercase" value={code} onChange={(e) => setCode(e.target.value)} placeholder="EL" />
          </div>
          <div>
            <Label htmlFor="ltName">Name</Label>
            <Input id="ltName" className="mt-1" value={name} onChange={(e) => setName(e.target.value)} placeholder="Earned Leave" />
          </div>
          <div>
            <Label htmlFor="ltDays">Days per year</Label>
            <Input id="ltDays" type="number" className="mt-1" value={days} onChange={(e) => setDays(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="ltCarry">Carry forward max</Label>
            <Input id="ltCarry" type="number" className="mt-1" value={carry} onChange={(e) => setCarry(e.target.value)} placeholder="Optional" />
          </div>
        </div>
        <Button type="button" disabled={!code.trim() || !name.trim() || createMut.isPending} onClick={() => createMut.mutate()}>
          {createMut.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Add type
        </Button>
      </GlassCard>

      <GlassCard level={2} className="overflow-hidden p-0">
        {listQuery.isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Days/year</th>
                <th className="px-4 py-3 text-left">Carry forward</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(listQuery.data ?? []).map((row) => (
                <tr key={row.id} className="border-b border-border/60">
                  <td className="px-4 py-3 font-mono">{row.code}</td>
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{row.daysPerYear}</td>
                  <td className="px-4 py-3">{row.carryForwardMax ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        void deleteLeaveType(token!, row.id).then(() => {
                          toast.success("Archived");
                          void qc.invalidateQueries({ queryKey: ["leave-types"] });
                        }).catch((e) => toast.error(e instanceof ApiError ? e.message : "Failed"));
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
