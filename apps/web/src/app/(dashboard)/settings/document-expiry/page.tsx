"use client";

import { useQuery } from "@tanstack/react-query";

import { FeatureGate } from "@/components/feature-modules/feature-gate";
import { GlassCard } from "@/components/ui/glass-card";
import { fetchExpiringDocuments } from "@/lib/api/feature-modules";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function DocumentExpiryPage() {
  const token = useAuthStore((s) => s.token);

  const listQuery = useQuery({
    queryKey: ["document-expiry", token],
    queryFn: () =>
      fetchExpiringDocuments(token!, 30) as Promise<
        Array<{
          documentType: string;
          originalFilename: string;
          expiresAt: string;
          employee: { name: string; employeeCode: string };
        }>
      >,
    enabled: !!token,
  });

  return (
    <FeatureGate flag="documentExpiry" title="Document expiry">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Documents expiring soon</h1>
        <GlassCard level={2} className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Document</th>
                <th className="px-4 py-3 text-left">Expires</th>
              </tr>
            </thead>
            <tbody>
              {(listQuery.data ?? []).map((d, i) => (
                <tr key={i} className="border-b border-border/60">
                  <td className="px-4 py-3">
                    {d.employee.name} ({d.employee.employeeCode})
                  </td>
                  <td className="px-4 py-3">
                    {d.documentType} — {d.originalFilename}
                  </td>
                  <td className="px-4 py-3">{new Date(d.expiresAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </div>
    </FeatureGate>
  );
}
