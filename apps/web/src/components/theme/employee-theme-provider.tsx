"use client";

import { ThemeProvider } from "next-themes";

export function EmployeeThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      themes={["light", "dark"]}
      storageKey="vetan-employee-theme"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}
