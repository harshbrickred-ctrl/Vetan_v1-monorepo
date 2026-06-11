"use client";

import { useQuery } from "@tanstack/react-query";

import { FeatureGate } from "@/components/feature-modules/feature-gate";
import { GlassCard } from "@/components/ui/glass-card";
import { fetchTrainingCourses } from "@/lib/api/feature-modules";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function TrainingAdminPage() {
  const token = useAuthStore((s) => s.token);
  const listQuery = useQuery({
    queryKey: ["training-courses", token],
    queryFn: () =>
      fetchTrainingCourses(token!) as Promise<
        Array<{ id: string; title: string; enrollmentCount: number }>
      >,
    enabled: !!token,
  });

  return (
    <FeatureGate flag="training" title="Training">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Training courses</h1>
        <GlassCard level={2} className="p-4">
          <ul className="space-y-2 text-sm">
            {(listQuery.data ?? []).map((c) => (
              <li key={c.id}>
                {c.title} — {c.enrollmentCount} enrolled
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </FeatureGate>
  );
}
