"use client";

import { useMemo } from "react";

import { Permission, permissionsForRole, type PermissionKey } from "@/lib/auth/permissions";
import { useAuthStore } from "@/lib/auth/auth-store";
import { permissionRequiresFeature } from "@/lib/feature-flags";
import { useFeatureFlags } from "@/lib/hooks/use-feature-flags";

const permissionValues = new Set<string>(Object.values(Permission));

export function usePermissions() {
  const role = useAuthStore((s) => s.user?.role);
  const apiPermissions = useAuthStore((s) => s.user?.permissions);
  const { isEnabled, isLoading: flagsLoading } = useFeatureFlags();

  return useMemo(() => {
    const set = new Set<PermissionKey>();
    if (apiPermissions?.length) {
      for (const p of apiPermissions) {
        if (permissionValues.has(p)) set.add(p as PermissionKey);
      }
    } else {
      for (const p of permissionsForRole(role ?? "")) set.add(p);
    }

    const hasPermission = (perm: PermissionKey) => {
      if (!set.has(perm)) return false;
      const requiredFeature = permissionRequiresFeature(perm);
      if (!requiredFeature) return true;
      if (flagsLoading) return false;
      return isEnabled(requiredFeature);
    };

    return { hasPermission, flagsLoading };
  }, [role, apiPermissions, isEnabled, flagsLoading]);
}
