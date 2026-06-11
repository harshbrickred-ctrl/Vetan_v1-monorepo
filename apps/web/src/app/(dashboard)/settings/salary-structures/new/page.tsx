"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { fetchSalaryComponents } from "@/lib/api/salary-components";
import { createSalaryStructure } from "@/lib/api/salary-structures";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useFeatureFlags } from "@/lib/hooks/use-feature-flags";

type LineDraft = {
  componentId: string;
  amount: string;
  percentOfBasic: string;
};

export default function NewSalaryStructurePage() {
  const token = useAuthStore((s) => s.token);
  const router = useRouter();
  const { isEnabled, isLoading: flagsLoading } = useFeatureFlags();
  const enabled = isEnabled("salaryStructuresAdmin");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<LineDraft[]>([
    { componentId: "", amount: "", percentOfBasic: "" },
  ]);

  const componentsQuery = useQuery({
    queryKey: ["salary-components", token],
    queryFn: () => fetchSalaryComponents(token!),
    enabled: !!token && enabled,
  });

  const createMut = useMutation({
    mutationFn: () =>
      createSalaryStructure(token!, {
        name: name.trim(),
        description: description.trim() || undefined,
        components: lines
          .filter((l) => l.componentId)
          .map((l, idx) => ({
            componentId: l.componentId,
            ...(l.amount ? { amount: Number(l.amount) } : {}),
            ...(l.percentOfBasic ? { percentOfBasic: Number(l.percentOfBasic) } : {}),
            sortOrder: idx,
          })),
      }),
    onSuccess: () => {
      toast.success("Structure created");
      router.push("/settings/salary-structures");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Failed"),
  });

  if (flagsLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!enabled) {
    return (
      <GlassCard level={2} className="p-6">
        <p className="text-sm text-muted-foreground">
          Enable salary structures admin in workspace settings.
        </p>
        <Link href="/settings/salary-structures" className="mt-2 inline-block text-sm underline">
          Back
        </Link>
      </GlassCard>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/settings/salary-structures" className="text-sm text-muted-foreground hover:underline">
          ← Salary structures
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-bold">
          New salary structure
        </h1>
      </div>

      <GlassCard level={2} className="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="ssName">Name</Label>
            <Input
              id="ssName"
              className="mt-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Standard CTC template"
            />
          </div>
          <div>
            <Label htmlFor="ssDesc">Description</Label>
            <Input
              id="ssDesc"
              className="mt-1"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">Components</h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                setLines((prev) => [
                  ...prev,
                  { componentId: "", amount: "", percentOfBasic: "" },
                ])
              }
            >
              <Plus className="size-4" />
              Add line
            </Button>
          </div>
          {lines.map((line, idx) => (
            <div key={idx} className="grid gap-2 rounded-lg border border-border p-3 sm:grid-cols-4">
              <select
                className="flex h-10 rounded-md border border-border bg-background px-2 text-sm sm:col-span-2"
                value={line.componentId}
                onChange={(e) => {
                  const v = e.target.value;
                  setLines((prev) =>
                    prev.map((l, i) => (i === idx ? { ...l, componentId: v } : l)),
                  );
                }}
              >
                <option value="">Select component</option>
                {(componentsQuery.data ?? []).map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.type})
                  </option>
                ))}
              </select>
              <Input
                type="number"
                placeholder="₹ amount"
                value={line.amount}
                onChange={(e) => {
                  const v = e.target.value;
                  setLines((prev) =>
                    prev.map((l, i) => (i === idx ? { ...l, amount: v } : l)),
                  );
                }}
              />
              <div className="flex gap-1">
                <Input
                  type="number"
                  placeholder="% of basic"
                  value={line.percentOfBasic}
                  onChange={(e) => {
                    const v = e.target.value;
                    setLines((prev) =>
                      prev.map((l, i) => (i === idx ? { ...l, percentOfBasic: v } : l)),
                    );
                  }}
                />
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  disabled={lines.length <= 1}
                  onClick={() => setLines((prev) => prev.filter((_, i) => i !== idx))}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          type="button"
          disabled={!name.trim() || createMut.isPending}
          onClick={() => createMut.mutate()}
        >
          {createMut.isPending ? <Loader2 className="size-4 animate-spin" /> : "Save structure"}
        </Button>
      </GlassCard>
    </div>
  );
}
