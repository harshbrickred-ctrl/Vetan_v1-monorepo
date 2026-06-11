import { parseUuidParam, requireAuth, withApi } from "@sangam/api-kit";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as shiftsService from "@/server/shifts/shifts-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const DELETE = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "shifts");
  const { id } = await params;
  return shiftsService.deleteRoster(user.tenantId, parseUuidParam(id, "id"));
});
