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
import { createLegalEntity, fetchLegalEntities } from "@/lib/api/feature-modules";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function LegalEntitiesPage() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const [name, setName] = useState("");

  const listQuery = useQuery({
    queryKey: ["legal-entities", token],
    queryFn: () =>
      fetchLegalEntities(token!) as Promise<Array<{ id: string; name: string; pan: string | null }>>,
    enabled: !!token,
  });

  const createMut = useMutation({
    mutationFn: () => createLegalEntity(token!, { name }),
    onSuccess: () => {
      toast.success("Entity created");
      setName("");
      void qc.invalidateQueries({ queryKey: ["legal-entities"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Failed"),
  });

  return (
    <FeatureGate flag="multiEntity" title="Legal entities">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Legal entities</h1>
        <GlassCard level={2} className="flex gap-4 p-4">
          <div className="flex-1">
            <Label>Name</Label>
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={() => createMut.mutate()} disabled={!name.trim()}>
              Add entity
            </Button>
          </div>
        </GlassCard>
        <GlassCard level={2} className="p-4">
          <ul className="space-y-2 text-sm">
            {(listQuery.data ?? []).map((e) => (
              <li key={e.id}>
                {e.name} {e.pan ? `· PAN ${e.pan}` : ""}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </FeatureGate>
  );
}
