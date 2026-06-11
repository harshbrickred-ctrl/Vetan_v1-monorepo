import { requireAuth, validateQuery, withApi } from "@sangam/api-kit";
import { Employees } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as employeesService from "@/server/employees/employees-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["employees:read"]);
  await requireFeature(user.tenantId, "contractorPayroll");
  const query = await validateQuery(req, Employees.ListEmployeesQuerySchema);
  return employeesService.list(user.tenantId, {
    ...query,
    employmentType: "CONTRACTOR",
  });
});
