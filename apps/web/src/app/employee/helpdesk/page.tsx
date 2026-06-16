"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { FeatureGate } from "@/components/feature-modules/feature-gate";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import { createMeHelpdeskTicket, fetchMeHelpdeskTickets } from "@/lib/api/feature-modules";
import { useAuthStore } from "@/lib/auth/auth-store";

export default function EmployeeHelpdeskPage() {
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const [subject, setSubject] = useState("");

  const listQuery = useQuery({
    queryKey: ["me-helpdesk", token],
    queryFn: () =>
      fetchMeHelpdeskTickets(token!) as Promise<
        Array<{ id: string; subject: string; status: string }>
      >,
    enabled: !!token,
  });

  const createMut = useMutation({
    mutationFn: () => createMeHelpdeskTicket(token!, { subject }),
    onSuccess: () => {
      toast.success("Ticket created");
      setSubject("");
      void qc.invalidateQueries({ queryKey: ["me-helpdesk"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Failed"),
  });

  return (
    <FeatureGate flag="helpdesk" title="Helpdesk" audience="employee">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Helpdesk</h1>
        <GlassCard level={2} className="flex gap-2 p-4">
          <Input
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <Button type="button" onClick={() => createMut.mutate()} disabled={!subject.trim()}>
            Submit
          </Button>
        </GlassCard>
        <GlassCard level={2} className="p-4">
          <ul className="space-y-2 text-sm">
            {(listQuery.data ?? []).map((t) => (
              <li key={t.id}>
                {t.subject} — <span className="text-muted-foreground">{t.status}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>
    </FeatureGate>
  );
}
