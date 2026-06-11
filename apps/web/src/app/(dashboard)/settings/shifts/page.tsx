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
import { createShift, fetchShifts } from "@/lib/api/feature-modules";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function ShiftsPage() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");

  const listQuery = useQuery({
    queryKey: ["shifts", token],
    queryFn: () =>
      fetchShifts(token!) as Promise<
        Array<{ id: string; name: string; startTime: string; endTime: string }>
      >,
    enabled: !!token,
  });

  const createMut = useMutation({
    mutationFn: () => createShift(token!, { name, startTime, endTime }),
    onSuccess: () => {
      toast.success("Shift created");
      setName("");
      void qc.invalidateQueries({ queryKey: ["shifts"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Failed"),
  });

  return (
    <FeatureGate flag="shifts" title="Shifts & rosters">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Shifts & rosters</h1>
        <GlassCard level={2} className="grid gap-4 p-4 sm:grid-cols-4">
          <div>
            <Label>Name</Label>
            <Input className="mt-1" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>Start</Label>
            <Input className="mt-1" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div>
            <Label>End</Label>
            <Input className="mt-1" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button type="button" onClick={() => createMut.mutate()} disabled={!name.trim()}>
              Add shift
            </Button>
          </div>
        </GlassCard>
        <GlassCard level={2} className="p-4">
          <ul className="space-y-2 text-sm">
            {(listQuery.data ?? []).map((s) => (
              <li key={s.id}>
                {s.name} — {s.startTime} to {s.endTime}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </FeatureGate>
  );
}
