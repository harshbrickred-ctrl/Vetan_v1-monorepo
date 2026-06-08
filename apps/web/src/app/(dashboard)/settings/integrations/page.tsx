"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  fetchIdCardIntegrationStatus,
  generateIdCardApiKey,
  revokeIdCardApiKey,
} from "@/lib/api/id-card-portal";
import { ApiError } from "@/lib/api/client";

export default function IntegrationsSettingsPage() {
  const qc = useQueryClient();
  const [revealedKey, setRevealedKey] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: ["id-card-integration"],
    queryFn: fetchIdCardIntegrationStatus,
  });

  const generateMutation = useMutation({
    mutationFn: generateIdCardApiKey,
    onSuccess: (data) => {
      setRevealedKey(data.apiKey);
      void qc.invalidateQueries({ queryKey: ["id-card-integration"] });
      toast.success("API key generated — copy it now");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Could not generate key"),
  });

  const revokeMutation = useMutation({
    mutationFn: revokeIdCardApiKey,
    onSuccess: () => {
      setRevealedKey(null);
      void qc.invalidateQueries({ queryKey: ["id-card-integration"] });
      toast.success("API key revoked");
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Could not revoke key"),
  });

  const status = statusQuery.data;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Integrations</h1>
        <p className="text-sm text-muted-foreground">
          Connect Vetan to the standalone ID Card Portal for bulk CR-80 card printing.
        </p>
      </div>

      <section className="rounded-xl border bg-card p-6 space-y-4">
        <h2 className="font-medium">ID Card Portal</h2>
        <p className="text-sm text-muted-foreground">
          Generate an API key for the portal to sync employees. Use the ID Cards link in the sidebar to
          open the portal with SSO.
        </p>

        {status?.configured ? (
          <p className="text-sm">
            Active key: <code className="rounded bg-muted px-1">{status.apiKeyPrefix}…</code>
            {status.createdAt ? (
              <span className="text-muted-foreground"> · created {new Date(status.createdAt).toLocaleDateString()}</span>
            ) : null}
          </p>
        ) : (
          <p className="text-sm text-amber-600">No API key configured yet.</p>
        )}

        {revealedKey ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-900 dark:bg-amber-950">
            <p className="font-medium text-amber-800 dark:text-amber-200">Copy this key now — it won&apos;t be shown again</p>
            <code className="mt-2 block break-all rounded bg-white p-2 text-xs dark:bg-black">{revealedKey}</code>
          </div>
        ) : null}

        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
          >
            {status?.configured ? "Rotate API key" : "Generate API key"}
          </Button>
          {status?.configured ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => revokeMutation.mutate()}
              disabled={revokeMutation.isPending}
            >
              Revoke
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
}
