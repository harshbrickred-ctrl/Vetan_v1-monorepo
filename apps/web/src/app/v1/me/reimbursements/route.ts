import { validateJson, withApi } from "@sangam/api-kit";
import { Reimbursements } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import { getLinkedEmployee } from "@/server/employee-portal/linked-employee";
import * as reimbursementsService from "@/server/reimbursements/reimbursements-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const emp = await getLinkedEmployee(req);
  await requireFeature(emp.tenantId, "reimbursements");
  return reimbursementsService.listForEmployee(emp.tenantId, emp.id);
});

export const POST = withApi(async (req) => {
  const emp = await getLinkedEmployee(req);
  await requireFeature(emp.tenantId, "reimbursements");
  const dto = await validateJson(req, Reimbursements.CreateReimbursementSchema);
  return reimbursementsService.create(emp.tenantId, emp.id, dto);
});
