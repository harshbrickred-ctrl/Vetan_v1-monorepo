import { parseUuidParam, requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { EmployeeLifecycle } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as lifecycleService from "@/server/employees/lifecycle-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["employees:write"]);
  await requireFeature(user.tenantId, "employeeLifecycle");
  const { id } = await params;
  const dto = await validateJson(req, EmployeeLifecycle.UpdateEmployeeLifecycleSchema);
  return lifecycleService.updateLifecycle(user.tenantId, parseUuidParam(id, "id"), dto);
});
