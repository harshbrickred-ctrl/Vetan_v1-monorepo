"use client";

import { useQuery } from "@tanstack/react-query";

import { FeatureGate } from "@/components/feature-modules/feature-gate";
import { GlassCard } from "@/components/ui/glass-card";
import { fetchAssets } from "@/lib/api/feature-modules";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function AssetsAdminPage() {
  const token = useAuthStore((s) => s.token);
  const listQuery = useQuery({
    queryKey: ["assets", token],
    queryFn: () =>
      fetchAssets(token!) as Promise<
        Array<{ id: string; name: string; serialNo: string | null; currentAssignee: { name: string } | null }>
      >,
    enabled: !!token,
  });

  return (
    <FeatureGate flag="assets" title="Assets">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Asset inventory</h1>
        <GlassCard level={2} className="p-4">
          <ul className="space-y-2 text-sm">
            {(listQuery.data ?? []).map((a) => (
              <li key={a.id}>
                {a.name}
                {a.serialNo ? ` (${a.serialNo})` : ""} —{" "}
                {a.currentAssignee ? `Assigned to ${a.currentAssignee.name}` : "Unassigned"}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </FeatureGate>
  );
}
