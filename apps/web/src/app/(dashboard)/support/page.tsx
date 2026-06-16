"use client";

import { useAuthStore } from "@/lib/auth/auth-store";
import { SupportPanel } from "@/components/support/support-panel";

export default function AdminSupportPage() {
  const token = useAuthStore((s) => s.token);
  if (!token) {
    return <p className="text-sm text-muted-foreground">Sign in to contact support.</p>;
  }
  return (
    <SupportPanel
      token={token}
      description="Reach Vetan for subscription changes, new module requests, billing questions, or technical assistance. Disabled modules in your admin portal can be enabled after our team confirms your request."
    />
  );
}
