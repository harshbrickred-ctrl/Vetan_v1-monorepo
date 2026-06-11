"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { FeatureGate } from "@/components/feature-modules/feature-gate";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { fetchMeTaxDeclaration, upsertMeTaxDeclaration } from "@/lib/api/feature-modules";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function EmployeeTaxPage() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const year = new Date().getFullYear();
  const [regime, setRegime] = useState<"OLD" | "NEW">("NEW");

  const declQuery = useQuery({
    queryKey: ["me-tax", token, year],
    queryFn: () => fetchMeTaxDeclaration(token!, year) as Promise<{ regime: string } | null>,
    enabled: !!token,
  });

  const saveMut = useMutation({
    mutationFn: () => upsertMeTaxDeclaration(token!, { year, regime, payload: {} }),
    onSuccess: () => {
      toast.success("Saved");
      void qc.invalidateQueries({ queryKey: ["me-tax"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Failed"),
  });

  return (
    <FeatureGate flag="taxDeclarations" title="Tax declarations">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Tax declaration — FY {year}</h1>
        <GlassCard level={2} className="space-y-4 p-4">
          <div>
            <Label>Tax regime</Label>
            <select
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              value={declQuery.data?.regime ?? regime}
              onChange={(e) => setRegime(e.target.value as "OLD" | "NEW")}
            >
              <option value="NEW">New regime</option>
              <option value="OLD">Old regime</option>
            </select>
          </div>
          <Button type="button" onClick={() => saveMut.mutate()}>
            Save declaration
          </Button>
        </GlassCard>
      </div>
    </FeatureGate>
  );
}
