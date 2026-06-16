"use client";

import { useAuthStore } from "@/lib/auth/auth-store";
import { SupportPanel } from "@/components/support/support-panel";

export default function EmployeeSupportPage() {
  const token = useAuthStore((s) => s.token);
  if (!token) {
    return <p className="text-sm text-muted-foreground">Sign in to contact support.</p>;
  }
  return (
    <SupportPanel
      token={token}
      title="Support"
      description="Contact Vetan support for help with your employee portal or workspace issues."
    />
  );
}
