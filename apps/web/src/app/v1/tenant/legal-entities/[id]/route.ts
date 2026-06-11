import { parseUuidParam, requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { LegalEntities } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as legalEntitiesService from "@/server/tenant/legal-entities-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "multiEntity");
  const { id } = await params;
  const dto = await validateJson(req, LegalEntities.UpdateLegalEntitySchema);
  return legalEntitiesService.update(user.tenantId, parseUuidParam(id, "id"), dto);
});

export const DELETE = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "multiEntity");
  const { id } = await params;
  return legalEntitiesService.remove(user.tenantId, parseUuidParam(id, "id"));
});
