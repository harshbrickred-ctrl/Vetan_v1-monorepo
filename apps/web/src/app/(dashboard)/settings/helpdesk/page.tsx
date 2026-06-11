"use client";

import { useQuery } from "@tanstack/react-query";

import { FeatureGate } from "@/components/feature-modules/feature-gate";
import { GlassCard } from "@/components/ui/glass-card";
import { fetchHelpdeskTickets } from "@/lib/api/feature-modules";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function HelpdeskAdminPage() {
  const token = useAuthStore((s) => s.token);
  const listQuery = useQuery({
    queryKey: ["helpdesk", token],
    queryFn: () =>
      fetchHelpdeskTickets(token!) as Promise<
        Array<{ id: string; subject: string; status: string; priority: string }>
      >,
    enabled: !!token,
  });

  return (
    <FeatureGate flag="helpdesk" title="Helpdesk">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Support tickets</h1>
        <GlassCard level={2} className="p-4">
          <ul className="space-y-2 text-sm">
            {(listQuery.data ?? []).map((t) => (
              <li key={t.id} className="flex justify-between border-b border-border/60 py-2">
                <span>{t.subject}</span>
                <span className="text-muted-foreground">
                  {t.status} · {t.priority}
                </span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </FeatureGate>
  );
}
