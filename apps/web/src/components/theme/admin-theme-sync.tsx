"use client";

import { useQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import { useEffect } from "react";

import { fetchTenant } from "@/lib/api/tenant";
import { useAuthStore } from "@/lib/auth/auth-store";
import { parseAdminThemeFromSettings } from "@/lib/themes/registry";

/** Applies workspace admin theme from tenant settings on dashboard load. */
export function AdminThemeSync() {
  const token = useAuthStore((s) => s.token);
  const { setTheme, resolvedTheme } = useTheme();

  const tenantQuery = useQuery({
    queryKey: ["tenant", "theme-sync", token],
    queryFn: () => fetchTenant(token!),
    enabled: !!token,
    staleTime: 60_000,
  });

  const adminTheme = parseAdminThemeFromSettings(tenantQuery.data?.settings);

  useEffect(() => {
    if (!tenantQuery.data) return;
    if (resolvedTheme !== adminTheme) {
      setTheme(adminTheme);
    }
  }, [adminTheme, tenantQuery.data, resolvedTheme, setTheme]);

  return null;
}
