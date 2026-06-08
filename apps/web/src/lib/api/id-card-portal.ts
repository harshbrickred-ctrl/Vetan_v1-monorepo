import { apiFetchJson } from "./client";

export async function fetchIdCardPortalLaunchUrl(): Promise<string> {
  const data = await apiFetchJson<{ url: string }>(
    "/v1/tenant/integrations/id-card-portal/launch-url",
  );
  return data.url;
}

export type IdCardIntegrationStatus = {
  configured: boolean;
  apiKeyPrefix: string | null;
  createdAt: string | null;
};

export async function fetchIdCardIntegrationStatus(): Promise<IdCardIntegrationStatus> {
  return apiFetchJson<IdCardIntegrationStatus>("/v1/tenant/integrations/id-card-portal");
}

export async function generateIdCardApiKey(): Promise<{ apiKey: string; apiKeyPrefix: string }> {
  return apiFetchJson<{ apiKey: string; apiKeyPrefix: string }>(
    "/v1/tenant/integrations/id-card-portal",
    { method: "POST" },
  );
}

export async function revokeIdCardApiKey(): Promise<void> {
  await apiFetchJson("/v1/tenant/integrations/id-card-portal", { method: "DELETE" });
}
