import { requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { LegalEntities } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as legalEntitiesService from "@/server/tenant/legal-entities-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:read"]);
  await requireFeature(user.tenantId, "multiEntity");
  return legalEntitiesService.list(user.tenantId);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "multiEntity");
  const dto = await validateJson(req, LegalEntities.CreateLegalEntitySchema);
  return legalEntitiesService.create(user.tenantId, dto);
});
