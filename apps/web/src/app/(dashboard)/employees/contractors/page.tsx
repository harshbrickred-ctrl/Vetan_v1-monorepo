"use client";

import { useQuery } from "@tanstack/react-query";

import { FeatureGate } from "@/components/feature-modules/feature-gate";
import { GlassCard } from "@/components/ui/glass-card";
import { fetchContractors } from "@/lib/api/feature-modules";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function ContractorsPage() {
  const token = useAuthStore((s) => s.token);

  const listQuery = useQuery({
    queryKey: ["contractors", token],
    queryFn: () =>
      fetchContractors(token!) as Promise<{
        items: Array<{ id: string; firstName: string; lastName: string; employeeCode: string }>;
      }>,
    enabled: !!token,
  });

  return (
    <FeatureGate flag="contractorPayroll" title="Contractor payroll">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Contractors</h1>
        <GlassCard level={2} className="p-4">
          <ul className="space-y-2 text-sm">
            {(listQuery.data?.items ?? []).map((e) => (
              <li key={e.id}>
                {e.firstName} {e.lastName} — {e.employeeCode}
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </FeatureGate>
  );
}
