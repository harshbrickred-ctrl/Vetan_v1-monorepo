import { apiFetchJson } from "./client";

export type PayGroupMember = {
  employeeId: string;
  employeeCode: string;
  employeeName: string;
};

export type PayGroupRow = {
  id: string;
  name: string;
  description: string | null;
  filterJson: unknown;
  memberCount: number;
  members: PayGroupMember[];
  createdAt: string;
  updatedAt: string;
};

export async function fetchPayGroups(token: string) {
  return apiFetchJson<PayGroupRow[]>("/v1/payroll/pay-groups", {
    method: "GET",
    token,
  });
}

export async function createPayGroup(
  token: string,
  payload: {
    name: string;
    description?: string;
    employeeIds?: string[];
  },
) {
  return apiFetchJson<PayGroupRow>("/v1/payroll/pay-groups", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updatePayGroup(
  token: string,
  id: string,
  payload: Partial<{
    name: string;
    description: string | null;
    employeeIds: string[];
  }>,
) {
  return apiFetchJson<PayGroupRow>(`/v1/payroll/pay-groups/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deletePayGroup(token: string, id: string) {
  return apiFetchJson<{ deleted: boolean }>(`/v1/payroll/pay-groups/${id}`, {
    method: "DELETE",
    token,
  });
}
