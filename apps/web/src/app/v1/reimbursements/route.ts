import { requireAuth, withApi } from "@sangam/api-kit";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as reimbursementsService from "@/server/reimbursements/reimbursements-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["payroll:read"]);
  await requireFeature(user.tenantId, "reimbursements");
  return reimbursementsService.listForTenant(user.tenantId);
});
