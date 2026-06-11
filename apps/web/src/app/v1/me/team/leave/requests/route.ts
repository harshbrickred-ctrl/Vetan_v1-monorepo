import { withApi } from "@sangam/api-kit";
import { getLinkedEmployee } from "@/server/employee-portal/linked-employee";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as teamService from "@/server/team/team-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const emp = await getLinkedEmployee(req);
  await requireFeature(emp.tenantId, "managerRole");
  return teamService.listTeamLeaveRequests(emp);
});
