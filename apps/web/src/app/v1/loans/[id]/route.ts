import { parseUuidParam, requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { Loans } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as loansService from "@/server/loans/loans-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["payroll:write"]);
  await requireFeature(user.tenantId, "loans");
  const { id } = await params;
  const dto = await validateJson(req, Loans.UpdateLoanSchema);
  return loansService.update(user.tenantId, parseUuidParam(id, "id"), dto);
});
