import { requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { Loans } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as loansService from "@/server/loans/loans-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["payroll:read"]);
  await requireFeature(user.tenantId, "loans");
  return loansService.list(user.tenantId);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["payroll:write"]);
  await requireFeature(user.tenantId, "loans");
  const dto = await validateJson(req, Loans.CreateLoanSchema);
  return loansService.create(user.tenantId, dto);
});
