import { apiFetchJson } from "./client";

export type TenantUserRow = {
  id: string;
  email: string;
  name: string;
  status: string;
  roles: Array<{ id: string; name: string }>;
  employee: { id: string; employeeCode: string } | null;
  createdAt: string;
};

export type TenantRoleRow = {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
};

export type UsersListResponse = {
  users: TenantUserRow[];
  roles: TenantRoleRow[];
};

export async function fetchTenantUsers(token: string) {
  return apiFetchJson<UsersListResponse>("/v1/tenant/users", {
    method: "GET",
    token,
  });
}

export async function assignUserRoles(
  token: string,
  userId: string,
  roleIds: string[],
) {
  return apiFetchJson<TenantUserRow>(`/v1/tenant/users/${userId}/roles`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ roleIds }),
  });
}
