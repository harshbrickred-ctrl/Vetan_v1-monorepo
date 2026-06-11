"use client";

import { useQuery } from "@tanstack/react-query";

import { FeatureGate } from "@/components/feature-modules/feature-gate";
import { GlassCard } from "@/components/ui/glass-card";
import { fetchMeTrainingEnrollments } from "@/lib/api/feature-modules";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function EmployeeTrainingPage() {
  const token = useAuthStore((s) => s.token);

  const listQuery = useQuery({
    queryKey: ["me-training", token],
    queryFn: () =>
      fetchMeTrainingEnrollments(token!) as Promise<
        Array<{ courseTitle: string; status: string }>
      >,
    enabled: !!token,
  });

  return (
    <FeatureGate flag="training" title="Training">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">My training</h1>
        <GlassCard level={2} className="p-4">
          <ul className="space-y-2 text-sm">
            {(listQuery.data ?? []).map((e, i) => (
              <li key={i}>
                {e.courseTitle} — {e.status}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </FeatureGate>
  );
}
