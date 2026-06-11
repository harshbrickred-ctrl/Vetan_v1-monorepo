import { parseUuidParam, requireAuth, withApi } from "@sangam/api-kit";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as visitorService from "@/server/visitors/visitor-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const POST = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["visitors:write"]);
  await requireFeature(user.tenantId, "visitorsV2");
  const { id } = await params;
  return visitorService.notifyHost(user.tenantId, parseUuidParam(id, "id"));
});
