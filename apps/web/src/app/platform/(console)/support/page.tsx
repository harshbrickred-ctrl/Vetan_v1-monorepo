"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Headphones, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ApiError } from "@/lib/api/client";
import {
  fetchPlatformSupportOpenCount,
  fetchPlatformSupportRequests,
  patchPlatformSupportStatus,
} from "@/lib/api/platform-support";
import { usePlatformAuthStore } from "@/lib/platform/auth-store";
import { formatDate } from "@/lib/utils/formatters";

export default function PlatformSupportPage() {
  const token = usePlatformAuthStore((s) => s.token);
  const qc = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: ["platform", "support", "summary", token],
    queryFn: () => fetchPlatformSupportOpenCount(token!),
    enabled: !!token,
  });

  const listQuery = useQuery({
    queryKey: ["platform", "support", "requests", token],
    queryFn: () => fetchPlatformSupportRequests(token!),
    enabled: !!token,
  });

  const patchStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "ACKNOWLEDGED" | "RESOLVED" }) =>
      patchPlatformSupportStatus(token!, id, status),
    onSuccess: () => {
      toast.success("Status updated");
      void qc.invalidateQueries({ queryKey: ["platform", "support"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Update failed"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Support inbox
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Queries raised by tenant admins and employees. Email notifications are sent on each new
          request.
        </p>
      </div>

      <GlassCard level={2} className="flex items-center gap-4 p-5">
        <Headphones className="size-8 text-[var(--brand-500)]" />
        <div>
          <p className="text-2xl font-bold tabular-nums">{summaryQuery.data?.open ?? "—"}</p>
          <p className="text-sm text-muted-foreground">Open requests</p>
        </div>
      </GlassCard>

      <GlassCard level={2} className="overflow-hidden p-0">
        {listQuery.isLoading ? (
          <p className="flex items-center gap-2 p-5 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading requests…
          </p>
        ) : !listQuery.data?.length ? (
          <p className="p-5 text-sm text-muted-foreground">No support requests yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-border bg-muted/30 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">When</th>
                  <th className="px-4 py-3 font-medium">Workspace</th>
                  <th className="px-4 py-3 font-medium">From</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listQuery.data.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 align-top">
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(r.createdAt)}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.tenantName}</p>
                      <p className="font-mono text-xs text-muted-foreground">{r.tenantSlug}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p>{r.requesterName}</p>
                      <p className="text-xs text-muted-foreground">
                        {r.requesterRole} · {r.requesterEmail}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{r.subject}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.message}</p>
                    </td>
                    <td className="px-4 py-3 capitalize">{r.status.toLowerCase()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-1">
                        {r.status === "OPEN" ? (
                          <Button
                            type="button"
                            size="xs"
                            variant="outline"
                            disabled={patchStatus.isPending}
                            onClick={() =>
                              patchStatus.mutate({ id: r.id, status: "ACKNOWLEDGED" })
                            }
                          >
                            Acknowledge
                          </Button>
                        ) : null}
                        {r.status !== "RESOLVED" ? (
                          <Button
                            type="button"
                            size="xs"
                            variant="secondary"
                            disabled={patchStatus.isPending}
                            onClick={() => patchStatus.mutate({ id: r.id, status: "RESOLVED" })}
                          >
                            Resolve
                          </Button>
                        ) : null}
                      </div>
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
