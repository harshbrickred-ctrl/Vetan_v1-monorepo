export const Permission = {
  "employees:read": "employees:read",
  "employees:write": "employees:write",
  "payroll:read": "payroll:read",
  "payroll:run": "payroll:run",
  "payroll:approve": "payroll:approve",
  "leave:read": "leave:read",
  "leave:write": "leave:write",
  "leave:approve": "leave:approve",
  "reports:read": "reports:read",
  "reports:write": "reports:write",
  "team:read": "team:read",
  "team:approve_leave": "team:approve_leave",
  "settings:read": "settings:read",
  "settings:write": "settings:write",
  "billing:read": "billing:read",
  "attendance:read": "attendance:read",
  "attendance:write": "attendance:write",
  "tasks:read": "tasks:read",
  "tasks:write": "tasks:write",
  "id-cards:read": "id-cards:read",
  "id-cards:write": "id-cards:write",
  "visitors:read": "visitors:read",
  "visitors:write": "visitors:write",
} as const;

export type PermissionKey = (typeof Permission)[keyof typeof Permission];

/** Admin has full tenant access; employees use /v1/me/* (no tenant permissions). */
const rolePermissions: Record<string, PermissionKey[]> = {
  admin: Object.values(Permission),
  manager: [
    Permission["team:read"],
    Permission["team:approve_leave"],
    Permission["leave:read"],
    Permission["leave:approve"],
    Permission["attendance:read"],
    Permission["employees:read"],
  ],
  employee: [],
};

export function permissionsForRole(role: string): PermissionKey[] {
  return rolePermissions[role] ?? rolePermissions.admin;
}
