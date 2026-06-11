"use client";

import { useQuery } from "@tanstack/react-query";

import { FeatureGate } from "@/components/feature-modules/feature-gate";
import { GlassCard } from "@/components/ui/glass-card";
import { fetchReimbursements } from "@/lib/api/feature-modules";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function ReimbursementsAdminPage() {
  const token = useAuthStore((s) => s.token);
  const listQuery = useQuery({
    queryKey: ["reimbursements", token],
    queryFn: () =>
      fetchReimbursements(token!) as Promise<
        Array<{ id: string; employeeName?: string; category: string; amount: number; status: string }>
      >,
    enabled: !!token,
  });

  return (
    <FeatureGate flag="reimbursements" title="Reimbursements">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Reimbursement claims</h1>
        <GlassCard level={2} className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {(listQuery.data ?? []).map((r) => (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="px-4 py-3">{r.employeeName ?? "—"}</td>
                  <td className="px-4 py-3">{r.category}</td>
                  <td className="px-4 py-3">₹{r.amount.toLocaleString("en-IN")}</td>
                  <td className="px-4 py-3">{r.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </div>
    </FeatureGate>
  );
}
