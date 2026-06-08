"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Palette } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";
import { toast } from "sonner";

import { buttonVariants } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { ApiError } from "@/lib/api/client";
import { fetchTenant, patchTenantSettings } from "@/lib/api/tenant";
import { Permission } from "@/lib/auth/permissions";
import { useAuthStore } from "@/lib/auth/auth-store";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { useIsClient } from "@/lib/hooks/use-is-client";
import {
  ADMIN_THEMES,
  type AdminThemeId,
  parseAdminThemeFromSettings,
} from "@/lib/themes/registry";
import { cn } from "@/lib/utils";

export default function AppearanceSettingsPage() {
  const token = useAuthStore((s) => s.token);
  const { hasPermission } = usePermissions();
  const canWrite = hasPermission(Permission["settings:write"]);
  const { setTheme, resolvedTheme } = useTheme();
  const mounted = useIsClient();
  const qc = useQueryClient();

  const tenantQuery = useQuery({
    queryKey: ["tenant", token],
    queryFn: () => fetchTenant(token!),
    enabled: !!token,
  });

  const savedTheme = parseAdminThemeFromSettings(tenantQuery.data?.settings);
  const activeTheme = (mounted ? resolvedTheme : savedTheme) as AdminThemeId | undefined;

  const saveMutation = useMutation({
    mutationFn: (adminTheme: AdminThemeId) =>
      patchTenantSettings(token!, { appearance: { adminTheme } }),
    onSuccess: () => {
      toast.success("Workspace theme saved.");
      void qc.invalidateQueries({ queryKey: ["tenant"] });
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : "Could not save theme"),
  });

  function selectTheme(id: AdminThemeId) {
    setTheme(id);
    if (canWrite) saveMutation.mutate(id);
  }

  if (!token) {
    return <p className="text-sm text-muted-foreground">Sign in to manage appearance.</p>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Appearance
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose the admin dashboard theme for your workspace. Employee portal keeps its own
          light/dark preference.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {ADMIN_THEMES.map((theme) => {
          const selected = activeTheme === theme.id;
          return (
            <button
              key={theme.id}
              type="button"
              disabled={!canWrite && !selected}
              onClick={() => selectTheme(theme.id)}
              className={cn(
                "text-left transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60",
                selected && "ring-2 ring-[var(--brand-500)] ring-offset-2 ring-offset-background rounded-xl",
              )}
            >
              <GlassCard level={2} className="overflow-hidden p-0" hoverable={false}>
                {theme.previewImage ? (
                  <div className="relative h-28 w-full border-b border-border bg-muted/30">
                    <Image
                      src={theme.previewImage}
                      alt={`${theme.label} palette preview`}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 640px) 100vw, 400px"
                    />
                  </div>
                ) : null}
                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{theme.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{theme.description}</p>
                    </div>
                    {selected ? (
                      <span className="flex size-6 items-center justify-center rounded-full bg-[var(--brand-500)] text-[var(--primary-foreground)]">
                        <Check className="size-3.5" />
                      </span>
                    ) : null}
                  </div>
                  <div className="flex gap-1.5">
                    {theme.swatches.map((hex) => (
                      <span
                        key={hex}
                        className="size-6 rounded-full border border-border shadow-sm"
                        style={{ backgroundColor: hex }}
                        title={hex}
                      />
                    ))}
                  </div>
                </div>
              </GlassCard>
            </button>
          );
        })}
      </div>

      {!canWrite ? (
        <p className="text-sm text-muted-foreground">
          You need settings write permission to change the workspace theme.
        </p>
      ) : saveMutation.isPending ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Saving theme…
        </p>
      ) : (
        <Link
          href="/settings/workspace"
          className={buttonVariants({ variant: "outline", className: "inline-flex gap-2" })}
        >
          <Palette className="size-4" />
          Back to workspace settings
        </Link>
      )}
    </div>
  );
}
