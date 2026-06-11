import { requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { Assets } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as assetsService from "@/server/assets/assets-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:read"]);
  await requireFeature(user.tenantId, "assets");
  return assetsService.list(user.tenantId);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "assets");
  const dto = await validateJson(req, Assets.CreateAssetSchema);
  return assetsService.create(user.tenantId, dto);
});
