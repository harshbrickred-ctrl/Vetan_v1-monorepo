import { parseUuidParam, requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { Reimbursements } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as reimbursementsService from "@/server/reimbursements/reimbursements-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["payroll:write"]);
  await requireFeature(user.tenantId, "reimbursements");
  const { id } = await params;
  const dto = await validateJson(req, Reimbursements.UpdateReimbursementStatusSchema);
  return reimbursementsService.updateStatus(user.tenantId, parseUuidParam(id, "id"), dto);
});
