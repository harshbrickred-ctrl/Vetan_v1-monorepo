"use client";

import { ThemeProvider } from "next-themes";

import { ADMIN_THEME_IDS } from "@/lib/themes/registry";

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      themes={[...ADMIN_THEME_IDS]}
      storageKey="vetan-admin-theme"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}
