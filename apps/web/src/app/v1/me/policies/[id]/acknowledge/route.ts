import { parseUuidParam, withApi } from "@sangam/api-kit";
import { requireFeature } from "@/server/tenant/feature-flags";
import { getLinkedEmployee } from "@/server/employee-portal/linked-employee";
import * as policyService from "@/server/policies/policy-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const POST = withApi(async (req, { params }: Ctx) => {
  const emp = await getLinkedEmployee(req);
  await requireFeature(emp.tenantId, "policyLibrary");
  const { id } = await params;
  return policyService.acknowledgePolicy(emp.tenantId, emp.id, parseUuidParam(id, "id"));
});
