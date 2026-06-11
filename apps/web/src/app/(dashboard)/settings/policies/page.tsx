"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { FeatureGate } from "@/components/feature-modules/feature-gate";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { createPolicy, fetchPolicies } from "@/lib/api/feature-modules";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function PoliciesAdminPage() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const listQuery = useQuery({
    queryKey: ["policies", token],
    queryFn: () => fetchPolicies(token!) as Promise<
      Array<{ id: string; title: string; version: string; publishedAt: string | null }>
    >,
    enabled: !!token,
  });

  const createMut = useMutation({
    mutationFn: () => createPolicy(token!, { title, body, publishedAt: new Date().toISOString() }),
    onSuccess: () => {
      toast.success("Policy published");
      setTitle("");
      setBody("");
      void qc.invalidateQueries({ queryKey: ["policies"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Failed"),
  });

  return (
    <FeatureGate flag="policyLibrary" title="Policy library">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Policy library</h1>
        <GlassCard level={2} className="space-y-4 p-4">
          <h2 className="font-medium">New policy</h2>
          <div>
            <Label htmlFor="pTitle">Title</Label>
            <Input id="pTitle" className="mt-1" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="pBody">Body</Label>
            <textarea
              id="pBody"
              className="mt-1 min-h-[120px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>
          <Button type="button" disabled={!title.trim() || !body.trim()} onClick={() => createMut.mutate()}>
            Publish
          </Button>
        </GlassCard>
        <GlassCard level={2} className="p-4">
          <ul className="space-y-2 text-sm">
            {(listQuery.data ?? []).map((p) => (
              <li key={p.id} className="flex justify-between border-b border-border/60 py-2">
                <span>{p.title}</span>
                <span className="text-muted-foreground">v{p.version}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </FeatureGate>
  );
}
