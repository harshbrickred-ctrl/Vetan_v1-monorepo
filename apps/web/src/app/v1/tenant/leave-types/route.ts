import { requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { LeaveTypes } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as leaveTypesService from "@/server/leave/leave-types-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:read"]);
  await requireFeature(user.tenantId, "leaveTypesAdmin");
  return leaveTypesService.list(user.tenantId);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "leaveTypesAdmin");
  const dto = await validateJson(req, LeaveTypes.CreateLeaveTypeSchema);
  return leaveTypesService.create(user.tenantId, dto);
});
