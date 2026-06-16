"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { FeatureGate } from "@/components/feature-modules/feature-gate";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ApiError } from "@/lib/api/client";
import { acknowledgePolicy, fetchMePolicies } from "@/lib/api/feature-modules";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function EmployeePoliciesPage() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();

  const listQuery = useQuery({
    queryKey: ["me-policies", token],
    queryFn: () =>
      fetchMePolicies(token!) as Promise<
        Array<{ id: string; title: string; body: string; acknowledgedAt: string | null }>
      >,
    enabled: !!token,
  });

  const ackMut = useMutation({
    mutationFn: (id: string) => acknowledgePolicy(token!, id),
    onSuccess: () => {
      toast.success("Acknowledged");
      void qc.invalidateQueries({ queryKey: ["me-policies"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Failed"),
  });

  return (
    <FeatureGate flag="policyLibrary" title="Policies" audience="employee">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Company policies</h1>
        {(listQuery.data ?? []).map((p) => (
          <GlassCard key={p.id} level={2} className="space-y-3 p-4">
            <h2 className="font-semibold">{p.title}</h2>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">{p.body}</p>
            {p.acknowledgedAt ? (
              <p className="text-xs text-green-600">Acknowledged {new Date(p.acknowledgedAt).toLocaleString()}</p>
            ) : (
              <Button type="button" size="sm" onClick={() => ackMut.mutate(p.id)}>
                I acknowledge
              </Button>
            )}
          </GlassCard>
        ))}
      </div>
    </FeatureGate>
  );
}
