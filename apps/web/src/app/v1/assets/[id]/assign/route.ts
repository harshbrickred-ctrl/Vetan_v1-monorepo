import { parseUuidParam, requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { Assets } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as assetsService from "@/server/assets/assets-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const POST = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "assets");
  const { id } = await params;
  const dto = await validateJson(req, Assets.AssignAssetSchema);
  return assetsService.assign(user.tenantId, parseUuidParam(id, "id"), dto);
});
