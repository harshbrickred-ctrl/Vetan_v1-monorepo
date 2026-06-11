import { requireAuth, validateJson, validateQuery, withApi } from "@sangam/api-kit";
import { Shifts } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as shiftsService from "@/server/shifts/shifts-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:read"]);
  await requireFeature(user.tenantId, "shifts");
  const q = await validateQuery(req, Shifts.ListRosterQuerySchema);
  return shiftsService.listRoster(user.tenantId, q);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "shifts");
  const dto = await validateJson(req, Shifts.CreateRosterAssignmentSchema);
  return shiftsService.createRoster(user.tenantId, dto);
});
