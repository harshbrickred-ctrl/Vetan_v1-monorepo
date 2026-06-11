import { parseUuidParam, requireAuth, withApi } from "@sangam/api-kit";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as assetsService from "@/server/assets/assets-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const POST = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "assets");
  const { id } = await params;
  return assetsService.returnAsset(user.tenantId, parseUuidParam(id, "id"));
});
