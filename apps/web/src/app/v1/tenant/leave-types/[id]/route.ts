import { parseUuidParam, requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { LeaveTypes } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as leaveTypesService from "@/server/leave/leave-types-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "leaveTypesAdmin");
  const { id } = await params;
  const dto = await validateJson(req, LeaveTypes.UpdateLeaveTypeSchema);
  return leaveTypesService.update(user.tenantId, parseUuidParam(id, "id"), dto);
});

export const DELETE = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "leaveTypesAdmin");
  const { id } = await params;
  return leaveTypesService.softDelete(user.tenantId, parseUuidParam(id, "id"));
});
