"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { VisitorRegisterForm } from "@/components/visitors/visitor-register-form";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import {
  fetchMeVisitorHosts,
  fetchMeVisitors,
  loadVisitorPhotoBlob,
  registerMeVisitor,
  type VisitorRow,
} from "@/lib/api/visitors";
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
    void loadVisitorPhotoBlob(token, visitorId, true).then((u) => {
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
    return <div className="size-12 shrink-0 rounded-md bg-muted" />;
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" className="size-12 shrink-0 rounded-md object-cover" />;
}

function VisitorListItem({ row, token }: { row: VisitorRow; token: string }) {
  return (
    <div className="flex gap-3 border-b border-border/60 px-4 py-3 last:border-0">
      {row.hasPhoto ? <VisitorPhotoThumb visitorId={row.id} token={token} /> : null}
      <div className="min-w-0 flex-1">
        <p className="font-medium">{row.name}</p>
        <p className="text-xs text-muted-foreground">{row.phone}</p>
        <p className="mt-1 text-sm">
          Meeting <span className="font-medium">{row.visitToName}</span>
        </p>
        <p className="text-xs text-muted-foreground">{row.purpose}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {formatVisitTime(row.visitedAt)} · Registered by {row.registeredByName}
        </p>
      </div>
    </div>
  );
}

export default function EmployeeVisitorsPage() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [searchDebounced, setSearchDebounced] = useState("");

  const employeesQuery = useQuery({
    queryKey: ["me", "visitor-hosts", token],
    queryFn: () => fetchMeVisitorHosts(token!),
    enabled: !!token,
  });

  const visitorsQuery = useQuery({
    queryKey: ["me", "visitors", searchDebounced, token],
    queryFn: () => fetchMeVisitors(token!, { search: searchDebounced, limit: 100 }),
    enabled: !!token,
  });

  const registerMutation = useMutation({
    mutationFn: (payload: Parameters<typeof registerMeVisitor>[1]) =>
      registerMeVisitor(token!, payload),
    onSuccess: () => {
      toast.success("Visitor registered");
      void qc.invalidateQueries({ queryKey: ["me", "visitors"] });
    },
    onError: (e) => {
      toast.error(e instanceof ApiError ? e.message : "Could not register visitor");
    },
  });

  const employees = employeesQuery.data ?? [];

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold md:text-3xl">
          Visitors
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Register a visitor when the person they came to meet is unavailable.
        </p>
      </div>

      <GlassCard level={2} className="p-4 md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <UserCheck className="size-4 text-[var(--brand-500)]" />
          <h2 className="font-medium">Register visitor</h2>
        </div>
        {employeesQuery.isLoading ? (
          <p className="text-sm text-muted-foreground">Loading employees…</p>
        ) : (
          <VisitorRegisterForm
            employees={employees}
            busy={registerMutation.isPending}
            onSubmit={(payload) => registerMutation.mutate(payload)}
          />
        )}
      </GlassCard>

      <GlassCard level={2} className="overflow-hidden p-0">
        <div className="border-b border-border px-4 py-3">
          <h2 className="font-medium">Recent visitors</h2>
          <div className="relative mt-3">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search name, phone, purpose…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onBlur={() => setSearchDebounced(search.trim())}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSearchDebounced(search.trim());
              }}
            />
          </div>
        </div>
        {visitorsQuery.isLoading ? (
          <p className="flex items-center gap-2 p-6 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading…
          </p>
        ) : (visitorsQuery.data ?? []).length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">No visitors recorded yet.</p>
        ) : (
          <div>
            {(visitorsQuery.data ?? []).map((row) => (
              <VisitorListItem key={row.id} row={row} token={token!} />
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
