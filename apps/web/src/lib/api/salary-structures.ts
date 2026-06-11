import { apiFetchJson } from "./client";

export type StructureComponentLine = {
  id: string;
  componentId: string;
  componentName: string;
  componentType: string;
  isTaxable: boolean;
  amount: number | null;
  percentOfBasic: number | null;
  sortOrder: number;
};

export type SalaryStructureRow = {
  id: string;
  name: string;
  description: string | null;
  isPublished: boolean;
  components: StructureComponentLine[];
  createdAt: string;
  updatedAt: string;
};

export async function fetchSalaryStructures(token: string) {
  return apiFetchJson<SalaryStructureRow[]>("/v1/tenant/salary-structures", {
    method: "GET",
    token,
  });
}

export async function fetchSalaryStructure(token: string, id: string) {
  return apiFetchJson<SalaryStructureRow>(`/v1/tenant/salary-structures/${id}`, {
    method: "GET",
    token,
  });
}

export async function createSalaryStructure(
  token: string,
  payload: {
    name: string;
    description?: string;
    isPublished?: boolean;
    components?: Array<{
      componentId: string;
      amount?: number;
      percentOfBasic?: number;
      sortOrder?: number;
    }>;
  },
) {
  return apiFetchJson<SalaryStructureRow>("/v1/tenant/salary-structures", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function updateSalaryStructure(
  token: string,
  id: string,
  payload: Partial<{
    name: string;
    description: string | null;
    isPublished: boolean;
    components: Array<{
      componentId: string;
      amount?: number;
      percentOfBasic?: number;
      sortOrder?: number;
    }>;
  }>,
) {
  return apiFetchJson<SalaryStructureRow>(`/v1/tenant/salary-structures/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(payload),
  });
}

export async function deleteSalaryStructure(token: string, id: string) {
  return apiFetchJson<{ deleted: boolean }>(
    `/v1/tenant/salary-structures/${id}`,
    { method: "DELETE", token },
  );
}
