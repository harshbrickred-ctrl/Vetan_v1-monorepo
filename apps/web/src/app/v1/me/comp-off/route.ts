import { validateJson, withApi } from "@sangam/api-kit";
import { CompOff } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import { getLinkedEmployee } from "@/server/employee-portal/linked-employee";
import * as compOffService from "@/server/comp-off/comp-off-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const emp = await getLinkedEmployee(req);
  await requireFeature(emp.tenantId, "compOff");
  return compOffService.listForEmployee(emp.tenantId, emp.id);
});

export const POST = withApi(async (req) => {
  const emp = await getLinkedEmployee(req);
  await requireFeature(emp.tenantId, "compOff");
  const dto = await validateJson(req, CompOff.CreateCompOffSchema);
  return compOffService.create(emp.tenantId, emp.id, dto);
});
