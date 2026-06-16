import { apiFetchJson } from "./client";

export type SupportCategory = "GENERAL" | "BILLING" | "FEATURE_REQUEST" | "TECHNICAL";

export type SupportRequest = {
  id: string;
  tenantId: string;
  tenantSlug: string | null;
  tenantName: string | null;
  userId: string | null;
  requesterRole: string;
  requesterName: string;
  requesterEmail: string;
  employeeId: string | null;
  subject: string;
  message: string;
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type SupportConfig = {
  supportEmail: string;
  whatsappNumber: string | null;
  whatsappEnabled: boolean;
};

export type CreateSupportResult = {
  request: SupportRequest;
  whatsappUrl: string | null;
  mailtoUrl: string;
  supportEmail: string;
};

export async function fetchSupportConfig(token: string) {
  return apiFetchJson<SupportConfig>("/v1/support/config", { method: "GET", token });
}

export async function fetchSupportRequests(token: string) {
  return apiFetchJson<SupportRequest[]>("/v1/support/requests", { method: "GET", token });
}

export async function createSupportRequest(
  token: string,
  body: { subject: string; message: string; category?: SupportCategory },
) {
  return apiFetchJson<CreateSupportResult>("/v1/support/requests", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

export async function fetchPlatformSupportRequests(
  token: string,
  params?: { status?: string },
) {
  const q = params?.status ? `?status=${encodeURIComponent(params.status)}` : "";
  return apiFetchJson<SupportRequest[]>(`/v1/platform/support/requests${q}`, {
    method: "GET",
    token,
  });
}

export async function patchPlatformSupportStatus(
  token: string,
  id: string,
  status: "OPEN" | "ACKNOWLEDGED" | "RESOLVED",
) {
  return apiFetchJson<SupportRequest>(`/v1/platform/support/requests/${id}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
}

export async function fetchPlatformSupportOpenCount(token: string) {
  return apiFetchJson<{ open: number }>("/v1/platform/support/summary", {
    method: "GET",
    token,
  });
}
