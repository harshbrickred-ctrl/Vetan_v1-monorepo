import { ApiError, getApiBaseUrl, pickErrorMessage } from "./client";

export type VisitorRow = {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  visitToName: string;
  visitToEmployeeId: string | null;
  visitedAt: string;
  hasPhoto: boolean;
  photoMimeType: string | null;
  registeredByEmployeeId: string;
  registeredByName: string;
  registeredByCode: string;
  createdAt: string;
};

export type CreateVisitorPayload = {
  name: string;
  phone: string;
  purpose: string;
  visitToName: string;
  visitToEmployeeId?: string;
  visitedAt: string;
  photo: File;
};

async function parseEnvelope<T>(res: Response): Promise<T> {
  let json: Record<string, unknown> = {};
  try {
    json = (await res.json()) as Record<string, unknown>;
  } catch {
    /* non-JSON */
  }
  if (!res.ok) {
    throw new ApiError(pickErrorMessage(json, res.statusText), res.status, json);
  }
  if (json.success !== true) {
    throw new ApiError(pickErrorMessage(json, "Request failed"), res.status, json);
  }
  return json.data as T;
}

export async function fetchVisitors(
  token: string,
  opts?: {
    search?: string;
    visitToEmployeeId?: string;
    from?: string;
    to?: string;
    limit?: number;
  },
) {
  const params = new URLSearchParams();
  if (opts?.search?.trim()) params.set("search", opts.search.trim());
  if (opts?.visitToEmployeeId) params.set("visitToEmployeeId", opts.visitToEmployeeId);
  if (opts?.from) params.set("from", opts.from);
  if (opts?.to) params.set("to", opts.to);
  if (opts?.limit) params.set("limit", String(opts.limit));
  const q = params.toString();
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/v1/visitors${q ? `?${q}` : ""}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  return parseEnvelope<VisitorRow[]>(res);
}

export async function registerVisitor(token: string, payload: CreateVisitorPayload) {
  const base = getApiBaseUrl();
  const fd = new FormData();
  fd.set("name", payload.name);
  fd.set("phone", payload.phone);
  fd.set("purpose", payload.purpose);
  fd.set("visitToName", payload.visitToName);
  if (payload.visitToEmployeeId) fd.set("visitToEmployeeId", payload.visitToEmployeeId);
  fd.set("visitedAt", payload.visitedAt);
  fd.set("photo", payload.photo);
  const res = await fetch(`${base}/v1/visitors`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
    credentials: "include",
  });
  return parseEnvelope<VisitorRow>(res);
}

export function visitorPhotoUrl(token: string, visitorId: string, me = false): string {
  const base = getApiBaseUrl();
  const path = me ? `/v1/me/visitors/${visitorId}/photo` : `/v1/visitors/${visitorId}/photo`;
  return `${base}${path}?token=${encodeURIComponent(token)}`;
}

export type VisitorHostOption = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
};

export async function fetchMeVisitorHosts(token: string) {
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/v1/me/visitor-hosts`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  return parseEnvelope<VisitorHostOption[]>(res);
}

export async function fetchMeVisitors(
  token: string,
  opts?: {
    search?: string;
    visitToEmployeeId?: string;
    from?: string;
    to?: string;
    limit?: number;
  },
) {
  const params = new URLSearchParams();
  if (opts?.search?.trim()) params.set("search", opts.search.trim());
  if (opts?.visitToEmployeeId) params.set("visitToEmployeeId", opts.visitToEmployeeId);
  if (opts?.from) params.set("from", opts.from);
  if (opts?.to) params.set("to", opts.to);
  if (opts?.limit) params.set("limit", String(opts.limit));
  const q = params.toString();
  const base = getApiBaseUrl();
  const res = await fetch(`${base}/v1/me/visitors${q ? `?${q}` : ""}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  return parseEnvelope<VisitorRow[]>(res);
}

export async function registerMeVisitor(token: string, payload: CreateVisitorPayload) {
  const base = getApiBaseUrl();
  const fd = new FormData();
  fd.set("name", payload.name);
  fd.set("phone", payload.phone);
  fd.set("purpose", payload.purpose);
  fd.set("visitToName", payload.visitToName);
  if (payload.visitToEmployeeId) fd.set("visitToEmployeeId", payload.visitToEmployeeId);
  fd.set("visitedAt", payload.visitedAt);
  fd.set("photo", payload.photo);
  const res = await fetch(`${base}/v1/me/visitors`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
    credentials: "include",
  });
  return parseEnvelope<VisitorRow>(res);
}

export async function loadVisitorPhotoBlob(
  token: string,
  visitorId: string,
  me = false,
): Promise<string> {
  const base = getApiBaseUrl();
  const path = me ? `/v1/me/visitors/${visitorId}/photo` : `/v1/visitors/${visitorId}/photo`;
  const res = await fetch(`${base}${path}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    credentials: "include",
  });
  if (!res.ok) {
    throw new ApiError("Could not load photo", res.status, null);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
