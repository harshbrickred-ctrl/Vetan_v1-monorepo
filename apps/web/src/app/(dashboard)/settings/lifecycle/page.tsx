"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { FeatureGate } from "@/components/feature-modules/feature-gate";
import { GlassCard } from "@/components/ui/glass-card";
import { fetchEmployees } from "@/lib/api/employees";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function LifecycleSettingsPage() {
  const token = useAuthStore((s) => s.token);
  const listQuery = useQuery({
    queryKey: ["employees", "lifecycle", token],
    queryFn: () => fetchEmployees(token!, { page: 1, pageSize: 50 }),
    enabled: !!token,
  });

  return (
    <FeatureGate flag="employeeLifecycle" title="Employee lifecycle">
      <div className="space-y-6">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
            Employee lifecycle
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage probation, confirmation, notice period, and exit dates per employee.
          </p>
        </div>
        <GlassCard level={2} className="overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Code</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(listQuery.data?.items ?? []).map((e) => (
                <tr key={e.id} className="border-b border-border/60">
                  <td className="px-4 py-3">
                    {e.firstName} {e.lastName}
                  </td>
                  <td className="px-4 py-3 font-mono">{e.employeeCode}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/employees/${e.id}?tab=lifecycle`}
                      className="text-[var(--brand-500)] hover:underline"
                    >
                      Edit lifecycle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </GlassCard>
      </div>
    </FeatureGate>
  );
}
