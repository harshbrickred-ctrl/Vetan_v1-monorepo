import { validateJson, withApi } from "@sangam/api-kit";
import { Helpdesk } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import { getLinkedEmployee } from "@/server/employee-portal/linked-employee";
import * as helpdeskService from "@/server/helpdesk/helpdesk-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const emp = await getLinkedEmployee(req);
  await requireFeature(emp.tenantId, "helpdesk");
  return helpdeskService.listForEmployee(emp.tenantId, emp.id);
});

export const POST = withApi(async (req) => {
  const emp = await getLinkedEmployee(req);
  await requireFeature(emp.tenantId, "helpdesk");
  const dto = await validateJson(req, Helpdesk.CreateTicketSchema);
  return helpdeskService.create(emp.tenantId, emp.id, dto);
});
