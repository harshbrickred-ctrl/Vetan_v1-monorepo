"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Headphones, Loader2, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import {
  createSupportRequest,
  fetchSupportConfig,
  fetchSupportRequests,
  type SupportCategory,
} from "@/lib/api/platform-support";
import { formatDate } from "@/lib/utils/formatters";

const CATEGORIES: { value: SupportCategory; label: string }[] = [
  { value: "GENERAL", label: "General" },
  { value: "BILLING", label: "Billing" },
  { value: "FEATURE_REQUEST", label: "Feature / module request" },
  { value: "TECHNICAL", label: "Technical issue" },
];

export function SupportPanel({
  token,
  title = "Support",
  description = "Reach the Vetan support team for billing, feature requests, or technical help.",
}: {
  token: string;
  title?: string;
  description?: string;
}) {
  const qc = useQueryClient();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<SupportCategory>("GENERAL");

  const configQuery = useQuery({
    queryKey: ["support", "config", token],
    queryFn: () => fetchSupportConfig(token),
    enabled: !!token,
  });

  const listQuery = useQuery({
    queryKey: ["support", "requests", token],
    queryFn: () => fetchSupportRequests(token),
    enabled: !!token,
  });

  const submit = useMutation({
    mutationFn: () => createSupportRequest(token, { subject, message, category }),
    onSuccess: (data) => {
      toast.success("Support request submitted");
      setSubject("");
      setMessage("");
      void qc.invalidateQueries({ queryKey: ["support", "requests"] });
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank", "noopener,noreferrer");
      }
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Could not submit request"),
  });

  const config = configQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <GlassCard level={2} className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <MessageCircle className="size-4 text-[var(--brand-500)]" />
            WhatsApp
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Submit a request below and we will open WhatsApp with your message pre-filled, or
            contact us directly.
          </p>
          {config?.whatsappEnabled ? (
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              +{config.whatsappNumber}
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              WhatsApp number not configured — use email or submit the form.
            </p>
          )}
        </GlassCard>
        <GlassCard level={2} className="p-5">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Mail className="size-4 text-[var(--brand-500)]" />
            Email
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            We email our support team and send you a confirmation when you submit a request.
          </p>
          {config?.supportEmail ? (
            <a
              href={`mailto:${config.supportEmail}`}
              className="mt-2 inline-block text-sm font-medium text-[var(--brand-500)] hover:underline"
            >
              {config.supportEmail}
            </a>
          ) : null}
        </GlassCard>
      </div>

      <GlassCard level={2} className="p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Headphones className="size-5" />
          Raise a support query
        </h2>
        <div className="mt-4 grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="support-cat">Category</Label>
            <select
              id="support-cat"
              className="h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value as SupportCategory)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-subject">Subject</Label>
            <Input
              id="support-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of your request"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="support-message">Message</Label>
            <textarea
              id="support-message"
              className="min-h-[120px] w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe your question or the modules you would like enabled…"
            />
          </div>
          <Button
            type="button"
            disabled={submit.isPending || subject.trim().length < 3 || message.trim().length < 10}
            onClick={() => submit.mutate()}
          >
            {submit.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Submit & continue on WhatsApp"
            )}
          </Button>
        </div>
      </GlassCard>

      <GlassCard level={2} className="p-5">
        <h2 className="text-sm font-semibold">Your requests</h2>
        {listQuery.isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        ) : !listQuery.data?.length ? (
          <p className="mt-3 text-sm text-muted-foreground">No support requests yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border text-sm">
            {listQuery.data.map((r) => (
              <li key={r.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
                <div>
                  <p className="font-medium">{r.subject}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.category} · {formatDate(r.createdAt)}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
                  {r.status.toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
