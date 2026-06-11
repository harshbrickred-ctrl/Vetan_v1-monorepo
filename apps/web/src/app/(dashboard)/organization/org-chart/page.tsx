"use client";

import { useQuery } from "@tanstack/react-query";

import { FeatureGate } from "@/components/feature-modules/feature-gate";
import { GlassCard } from "@/components/ui/glass-card";
import { fetchOrgChart } from "@/lib/api/feature-modules";
import { useAuthStore } from "@/lib/auth/auth-store";

type OrgNode = {
  id: string;
  name: string;
  employeeCode: string;
  designation: string | null;
  department: string | null;
  children: OrgNode[];
};

function OrgTree({ nodes, depth = 0 }: { nodes: OrgNode[]; depth?: number }) {
  if (!nodes.length) return null;
  return (
    <ul className={depth ? "ml-6 border-l border-border pl-4" : ""}>
      {nodes.map((n) => (
        <li key={n.id} className="py-2">
          <p className="font-medium">{n.name}</p>
          <p className="text-xs text-muted-foreground">
            {[n.employeeCode, n.designation, n.department].filter(Boolean).join(" · ")}
          </p>
          <OrgTree nodes={n.children} depth={depth + 1} />
        </li>
      ))}
    </ul>
  );
}

export default function OrgChartPage() {
  const token = useAuthStore((s) => s.token);
  const chartQuery = useQuery({
    queryKey: ["org-chart", token],
    queryFn: () => fetchOrgChart(token!) as Promise<OrgNode[]>,
    enabled: !!token,
  });

  return (
    <FeatureGate flag="orgChart" title="Org chart">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Organization chart</h1>
        <GlassCard level={2} className="p-6">
          {chartQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (
            <OrgTree nodes={chartQuery.data ?? []} />
          )}
        </GlassCard>
      </div>
    </FeatureGate>
  );
}
