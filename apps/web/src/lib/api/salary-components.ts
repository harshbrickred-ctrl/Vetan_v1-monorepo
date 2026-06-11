import { apiFetchJson } from "./client";

export type SalaryComponentRow = {
  id: string;
  name: string;
  type: string;
  isTaxable: boolean;
  metadata: unknown;
  createdAt: string;
  updatedAt: string;
};

export async function fetchSalaryComponents(token: string) {
  return apiFetchJson<SalaryComponentRow[]>("/v1/tenant/salary-components", {
    method: "GET",
    token,
  });
}

export async function createSalaryComponent(
  token: string,
  payload: {
    name: string;
    type: string;
    isTaxable?: boolean;
    metadata?: Record<string, unknown>;
  },
) {
  return apiFetchJson<SalaryComponentRow>("/v1/tenant/salary-components", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateSalaryComponent(
  token: string,
  id: string,
  payload: Partial<{
    name: string;
    type: string;
    isTaxable: boolean;
    metadata: Record<string, unknown> | null;
  }>,
) {
  return apiFetchJson<SalaryComponentRow>(`/v1/tenant/salary-components/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteSalaryComponent(token: string, id: string) {
  return apiFetchJson<{ deleted: boolean }>(
    `/v1/tenant/salary-components/${id}`,
    { method: "DELETE", token },
  );
}
