import { apiFetchJson } from "./client";

export type LeaveTypeRow = {
  id: string;
  code: string;
  name: string;
  daysPerYear: number;
  carryForwardMax: number | null;
  createdAt: string;
  updatedAt: string;
};

export async function fetchLeaveTypes(token: string) {
  return apiFetchJson<LeaveTypeRow[]>("/v1/tenant/leave-types", {
    method: "GET",
    token,
  });
}

export async function createLeaveType(
  token: string,
  payload: { code: string; name: string; daysPerYear: number; carryForwardMax?: number },
) {
  return apiFetchJson<LeaveTypeRow>("/v1/tenant/leave-types", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateLeaveType(
  token: string,
  id: string,
  payload: Partial<{ name: string; daysPerYear: number; carryForwardMax: number | null }>,
) {
  return apiFetchJson<LeaveTypeRow>(`/v1/tenant/leave-types/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteLeaveType(token: string, id: string) {
  return apiFetchJson<{ deleted: boolean }>(`/v1/tenant/leave-types/${id}`, {
    method: "DELETE",
    token,
  });
}
