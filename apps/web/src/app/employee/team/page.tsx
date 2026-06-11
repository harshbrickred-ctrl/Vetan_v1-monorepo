"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { FeatureUpgradeScreen } from "@/components/feature-modules/feature-upgrade-screen";
import { GlassCard } from "@/components/ui/glass-card";
import { LeaveStatusBadge } from "@/components/employee/leave-status-badge";
import {
  fetchTeamAttendance,
  fetchTeamLeaveRequests,
} from "@/lib/api/team";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useFeatureFlags } from "@/lib/hooks/use-feature-flags";

export default function EmployeeTeamPage() {
  const token = useAuthStore((s) => s.token);
  const { isEnabled, isLoading: flagsLoading } = useFeatureFlags();
  const enabled = isEnabled("managerRole");

  const leaveQuery = useQuery({
    queryKey: ["team-leave", token],
    queryFn: () => fetchTeamLeaveRequests(token!),
    enabled: !!token && enabled,
  });

  const attendanceQuery = useQuery({
    queryKey: ["team-attendance", token],
    queryFn: () => fetchTeamAttendance(token!),
    enabled: !!token && enabled,
  });

  if (flagsLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!enabled) {
    return <FeatureUpgradeScreen title="My team" flag="managerRole" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">My team</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Leave requests and attendance for your direct reports.
        </p>
      </div>

      <GlassCard level={2} className="overflow-hidden p-0">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-medium">Leave requests</h2>
        </div>
        {leaveQuery.isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : (leaveQuery.data ?? []).length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">No leave requests from your team.</p>
        ) : (
          <div className="divide-y divide-border">
            {(leaveQuery.data ?? []).map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                <div>
                  <p className="font-medium">
                    {r.employeeName}{" "}
                    <span className="font-mono text-xs text-muted-foreground">
                      {r.employeeCode}
                    </span>
                  </p>
                  <p className="text-muted-foreground">
                    {r.leaveType} · {r.startDate} → {r.endDate} · {r.workingDays} day(s)
                  </p>
                </div>
                <LeaveStatusBadge status={r.status} />
              </div>
            ))}
          </div>
        )}
      </GlassCard>

      <GlassCard level={2} className="overflow-hidden p-0">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-medium">Recent attendance</h2>
        </div>
        {attendanceQuery.isLoading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : (attendanceQuery.data ?? []).length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No attendance records. Assign reporting managers on employee profiles.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-2 text-left">Employee</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {(attendanceQuery.data ?? []).slice(0, 50).map((row) => (
                <tr key={row.id} className="border-b border-border/50">
                  <td className="px-4 py-2">{row.employeeName}</td>
                  <td className="px-4 py-2 font-mono text-xs">{row.date}</td>
                  <td className="px-4 py-2">{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>

      <p className="text-xs text-muted-foreground">
        Set reporting managers in{" "}
        <Link href="/employees" className="text-[var(--brand-500)] underline">
          employee profiles
        </Link>{" "}
        (admin).
      </p>
    </div>
  );
}
