import { parseUuidParam, requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { AttendanceRegularization } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as regService from "@/server/attendance/regularization-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["attendance:write"]);
  await requireFeature(user.tenantId, "attendanceRegularization");
  const { id } = await params;
  const dto = await validateJson(req, AttendanceRegularization.UpdateRegularizationStatusSchema);
  return regService.updateStatus(user.tenantId, parseUuidParam(id, "id"), dto);
});
