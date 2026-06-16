"use client";

import { useQuery } from "@tanstack/react-query";

import { FeatureGate } from "@/components/feature-modules/feature-gate";
import { GlassCard } from "@/components/ui/glass-card";
import { fetchMeAnnouncements } from "@/lib/api/feature-modules";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function EmployeeAnnouncementsPage() {
  const token = useAuthStore((s) => s.token);

  const feedQuery = useQuery({
    queryKey: ["me-announcements", token],
    queryFn: () =>
      fetchMeAnnouncements(token!) as Promise<
        Array<{ id: string; title: string; body: string; pinned: boolean; createdAt: string }>
      >,
    enabled: !!token,
  });

  return (
    <FeatureGate flag="announcements" title="Announcements" audience="employee">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Announcements</h1>
        {(feedQuery.data ?? []).map((a) => (
          <GlassCard key={a.id} level={2} className="p-4">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold">{a.title}</h2>
              {a.pinned ? (
                <span className="rounded bg-[var(--brand-500)]/10 px-2 py-0.5 text-xs text-[var(--brand-500)]">
                  Pinned
                </span>
              ) : null}
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{a.body}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {new Date(a.createdAt).toLocaleString()}
            </p>
          </GlassCard>
        ))}
      </div>
    </FeatureGate>
  );
}
