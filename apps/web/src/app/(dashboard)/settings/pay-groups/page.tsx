"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import {
  createPayGroup,
  deletePayGroup,
  fetchPayGroups,
} from "@/lib/api/pay-groups";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useFeatureFlags } from "@/lib/hooks/use-feature-flags";

export default function PayGroupsPage() {
  const token = useAuthStore((s) => s.token);
  const { isEnabled, isLoading: flagsLoading } = useFeatureFlags();
  const qc = useQueryClient();
  const enabled = isEnabled("payGroups");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const listQuery = useQuery({
    queryKey: ["pay-groups", token],
    queryFn: () => fetchPayGroups(token!),
    enabled: !!token && enabled,
  });

  const createMut = useMutation({
    mutationFn: () =>
      createPayGroup(token!, {
        name: name.trim(),
        description: description.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success("Pay group created");
      setName("");
      setDescription("");
      void qc.invalidateQueries({ queryKey: ["pay-groups"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Failed"),
  });

  if (flagsLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!enabled) {
    return (
      <GlassCard level={2} className="p-6">
        <h1 className="text-2xl font-bold">Pay groups</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enable <strong>Pay groups</strong> in{" "}
          <Link href="/settings/workspace?tab=saas" className="text-[var(--brand-500)] underline">
            Workspace → SaaS → Feature modules
          </Link>{" "}
          to segment payroll runs.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">Pay groups</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Group employees by pay policy for phased or segmented payroll runs.
        </p>
      </div>

      <GlassCard level={2} className="space-y-4 p-4">
        <h2 className="font-medium">Create pay group</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="pgName">Name</Label>
            <Input
              id="pgName"
              className="mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Monthly staff"
            />
          </div>
          <div>
            <Label htmlFor="pgDesc">Description</Label>
            <Input
              id="pgDesc"
              className="mt-1"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
        <Button
          type="button"
          disabled={!name.trim() || createMut.isPending}
          onClick={() => createMut.mutate()}
        >
          {createMut.isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
          Create group
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
                <th className="px-4 py-3 text-left">Members</th>
                <th className="px-4 py-3 text-left">Description</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(listQuery.data ?? []).map((row) => (
                <tr key={row.id} className="border-b border-border/60">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">{row.memberCount}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.description ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => {
                        void deletePayGroup(token!, row.id)
                          .then(() => {
                            toast.success("Archived");
                            void qc.invalidateQueries({ queryKey: ["pay-groups"] });
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
