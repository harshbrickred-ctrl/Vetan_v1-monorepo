"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchEmployees } from "@/lib/api/employees";
import { fetchVisitors, loadVisitorPhotoBlob, type VisitorRow } from "@/lib/api/visitors";
import { useAuthStore } from "@/lib/auth/auth-store";

function formatVisitTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function VisitorPhotoThumb({ visitorId, token }: { visitorId: string; token: string }) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    void loadVisitorPhotoBlob(token, visitorId).then((u) => {
      if (!cancelled) {
        url = u;
        setSrc(u);
      }
    });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [visitorId, token]);

  if (!src) {
    return <div className="size-10 rounded-md bg-muted" />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="size-10 rounded-md object-cover" />;
}

export default function VisitorsPage() {
  const token = useAuthStore((s) => s.token);
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const employeesQuery = useQuery({
    queryKey: ["employees", "visitor-filter", token],
    queryFn: () =>
      fetchEmployees(token!, { page: 1, pageSize: 200, record: "active", status: "ACTIVE" }),
    enabled: !!token,
  });

  const queryParams = useMemo(
    () => ({
      search: searchDebounced || undefined,
      visitToEmployeeId: employeeId || undefined,
      from: from || undefined,
      to: to || undefined,
      limit: 200,
    }),
    [searchDebounced, employeeId, from, to],
  );

  const visitorsQuery = useQuery({
    queryKey: ["visitors", queryParams, token],
    queryFn: () => fetchVisitors(token!, queryParams),
    enabled: !!token,
  });

  const rows = visitorsQuery.data ?? [];
  const todayCount = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return rows.filter((r) => r.visitedAt.startsWith(today)).length;
  }, [rows]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">Visitors</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track guests registered by your team when the host is unavailable.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GlassCard level={2} className="!p-4">
          <p className="text-xs text-muted-foreground">Total (filtered)</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{rows.length}</p>
        </GlassCard>
        <GlassCard level={2} className="!p-4">
          <p className="text-xs text-muted-foreground">Today (in view)</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{todayCount}</p>
        </GlassCard>
      </div>

      <GlassCard level={2} className="space-y-4 p-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Label htmlFor="visSearch">Search</Label>
            <div className="relative mt-1">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="visSearch"
                className="pl-9"
                placeholder="Name, phone, purpose…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={() => setSearchDebounced(search.trim())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSearchDebounced(search.trim());
                }}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="visHost">Meeting with</Label>
            <select
              id="visHost"
              className="mt-1 flex h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
            >
              <option value="">Anyone</option>
              {(employeesQuery.data?.items ?? []).map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.employeeCode} — {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="visFrom">From</Label>
            <Input
              id="visFrom"
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="visTo">To</Label>
            <Input
              id="visTo"
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </GlassCard>

      <GlassCard level={2} className="overflow-hidden p-0">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <UserRound className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Visitor log</span>
        </div>
        {visitorsQuery.isLoading ? (
          <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No visitors match this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Photo</th>
                  <th className="px-4 py-3 text-left font-medium">Visitor</th>
                  <th className="px-4 py-3 text-left font-medium">Phone</th>
                  <th className="px-4 py-3 text-left font-medium">Meeting with</th>
                  <th className="px-4 py-3 text-left font-medium">Purpose</th>
                  <th className="px-4 py-3 text-left font-medium">Visit time</th>
                  <th className="px-4 py-3 text-left font-medium">Registered by</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r: VisitorRow) => (
                  <tr key={r.id} className="border-b border-border/60">
                    <td className="px-4 py-3">
                      {r.hasPhoto && token ? (
                        <VisitorPhotoThumb visitorId={r.id} token={token} />
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{r.name}</td>
                    <td className="px-4 py-3 font-mono text-xs">{r.phone}</td>
                    <td className="px-4 py-3">{r.visitToName}</td>
                    <td className="max-w-[14rem] truncate px-4 py-3 text-muted-foreground">
                      {r.purpose}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                      {formatVisitTime(r.visitedAt)}
                    </td>
                    <td className="px-4 py-3">
                      {r.registeredByName}
                      <span className="ml-1 font-mono text-xs text-muted-foreground">
                        {r.registeredByCode}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
