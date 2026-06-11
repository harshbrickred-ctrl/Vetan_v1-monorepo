import { withApi } from "@sangam/api-kit";
import { requireFeature } from "@/server/tenant/feature-flags";
import { getLinkedEmployee } from "@/server/employee-portal/linked-employee";
import * as policyService from "@/server/policies/policy-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const emp = await getLinkedEmployee(req);
  await requireFeature(emp.tenantId, "policyLibrary");
  return policyService.listPublishedForEmployee(emp.tenantId, emp.id);
});
