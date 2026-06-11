"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { FeatureGate } from "@/components/feature-modules/feature-gate";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { fetchEmployeeDirectory } from "@/lib/api/feature-modules";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function EmployeeDirectoryPage() {
  const token = useAuthStore((s) => s.token);
  const [search, setSearch] = useState("");

  const listQuery = useQuery({
    queryKey: ["employee-directory", token, search],
    queryFn: () =>
      fetchEmployeeDirectory(token!, search || undefined) as Promise<
        Array<{
          name: string;
          email: string;
          department: string | null;
          designation: string | null;
          managerName: string | null;
        }>
      >,
    enabled: !!token,
  });

  return (
    <FeatureGate flag="employeeDirectory" title="Employee directory">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Employee directory</h1>
        <Input
          placeholder="Search by name, email, or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {(listQuery.data ?? []).map((e, i) => (
            <GlassCard key={i} level={2} className="p-4">
              <p className="font-medium">{e.name}</p>
              <p className="text-sm text-muted-foreground">{e.email}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {[e.designation, e.department, e.managerName ? `Reports to ${e.managerName}` : null]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </GlassCard>
          ))}
        </div>
      </div>
    </FeatureGate>
  );
}
