import { validateJson, withApi } from "@sangam/api-kit";
import { AttendanceRegularization } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import { getLinkedEmployee } from "@/server/employee-portal/linked-employee";
import * as regService from "@/server/attendance/regularization-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const emp = await getLinkedEmployee(req);
  await requireFeature(emp.tenantId, "attendanceRegularization");
  return regService.listForEmployee(emp.tenantId, emp.id);
});

export const POST = withApi(async (req) => {
  const emp = await getLinkedEmployee(req);
  await requireFeature(emp.tenantId, "attendanceRegularization");
  const dto = await validateJson(req, AttendanceRegularization.CreateRegularizationSchema);
  return regService.create(emp.tenantId, emp.id, dto);
});
