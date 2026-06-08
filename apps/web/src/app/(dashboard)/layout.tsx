import { DashboardAuthGuard } from "@/components/layout/dashboard-auth-guard";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AdminThemeProvider } from "@/components/theme/admin-theme-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminThemeProvider>
      <DashboardAuthGuard>
        <DashboardShell>{children}</DashboardShell>
      </DashboardAuthGuard>
    </AdminThemeProvider>
  );
}
