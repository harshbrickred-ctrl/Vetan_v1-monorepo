import { parseUuidParam, requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { Shifts } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as shiftsService from "@/server/shifts/shifts-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "shifts");
  const { id } = await params;
  const dto = await validateJson(req, Shifts.UpdateShiftSchema);
  return shiftsService.updateShift(user.tenantId, parseUuidParam(id, "id"), dto);
});

export const DELETE = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "shifts");
  const { id } = await params;
  return shiftsService.deleteShift(user.tenantId, parseUuidParam(id, "id"));
});
