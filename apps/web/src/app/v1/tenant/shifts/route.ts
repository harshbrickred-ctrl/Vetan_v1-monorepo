import { requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { Shifts } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as shiftsService from "@/server/shifts/shifts-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:read"]);
  await requireFeature(user.tenantId, "shifts");
  return shiftsService.listShifts(user.tenantId);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "shifts");
  const dto = await validateJson(req, Shifts.CreateShiftSchema);
  return shiftsService.createShift(user.tenantId, dto);
});
