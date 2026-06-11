"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { assignUserRoles, fetchTenantUsers } from "@/lib/api/users";
import { useAuthStore } from "@/lib/auth/auth-store";
import { useFeatureFlags } from "@/lib/hooks/use-feature-flags";

export default function UsersPage() {
  const token = useAuthStore((s) => s.token);
  const { isEnabled, isLoading: flagsLoading } = useFeatureFlags();
  const qc = useQueryClient();
  const enabled = isEnabled("granularRbac");

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const listQuery = useQuery({
    queryKey: ["tenant-users", token],
    queryFn: () => fetchTenantUsers(token!),
    enabled: !!token && enabled,
  });

  const assignMut = useMutation({
    mutationFn: ({ userId, roleIds }: { userId: string; roleIds: string[] }) =>
      assignUserRoles(token!, userId, roleIds),
    onSuccess: () => {
      toast.success("Roles updated");
      setEditingUserId(null);
      void qc.invalidateQueries({ queryKey: ["tenant-users"] });
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : "Failed"),
  });

  if (flagsLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!enabled) {
    return (
      <GlassCard level={2} className="p-6">
        <h1 className="text-2xl font-bold">Users & roles</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enable <strong>Granular RBAC & users admin</strong> in{" "}
          <Link href="/settings/workspace?tab=saas" className="text-[var(--brand-500)] underline">
            Workspace → SaaS → Feature modules
          </Link>{" "}
          to assign roles per user.
        </p>
      </GlassCard>
    );
  }

  const roles = listQuery.data?.roles ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-3xl font-bold">
          Users & roles
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Assign workspace roles to control who can run payroll, approve leave, and manage settings.
        </p>
      </div>

      <GlassCard level={2} className="overflow-hidden p-0">
        {listQuery.isLoading ? (
          <p className="p-6 text-sm text-muted-foreground">Loading…</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>
                <th className="px-4 py-3 text-left">User</th>
                <th className="px-4 py-3 text-left">Employee</th>
                <th className="px-4 py-3 text-left">Roles</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(listQuery.data?.users ?? []).map((user) => (
                <tr key={user.id} className="border-b border-border/60 align-top">
                  <td className="px-4 py-3">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {user.employee?.employeeCode ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {editingUserId === user.id ? (
                      <div className="space-y-2">
                        {roles.map((role) => (
                          <label key={role.id} className="flex items-center gap-2 text-xs">
                            <input
                              type="checkbox"
                              checked={selectedRoleIds.includes(role.id)}
                              onChange={(e) => {
                                setSelectedRoleIds((prev) =>
                                  e.target.checked
                                    ? [...prev, role.id]
                                    : prev.filter((id) => id !== role.id),
                                );
                              }}
                            />
                            <span className="font-medium">{role.name}</span>
                            <span className="text-muted-foreground">
                              ({role.permissions.length} perms)
                            </span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length ? (
                          user.roles.map((r) => (
                            <span
                              key={r.id}
                              className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium"
                            >
                              {r.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-muted-foreground">No roles</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {editingUserId === user.id ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingUserId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          disabled={assignMut.isPending}
                          onClick={() =>
                            assignMut.mutate({
                              userId: user.id,
                              roleIds: selectedRoleIds,
                            })
                          }
                        >
                          {assignMut.isPending ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            "Save"
                          )}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingUserId(user.id);
                          setSelectedRoleIds(user.roles.map((r) => r.id));
                        }}
                      >
                        Edit roles
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </div>
  );
}
