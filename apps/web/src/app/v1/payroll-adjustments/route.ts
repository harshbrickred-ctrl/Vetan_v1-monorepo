import { requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { PayrollAdjustments } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as adjustmentsService from "@/server/payroll/adjustments-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["payroll:read"]);
  await requireFeature(user.tenantId, "payrollAdjustments");
  return adjustmentsService.list(user.tenantId);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["payroll:write"]);
  await requireFeature(user.tenantId, "payrollAdjustments");
  const dto = await validateJson(req, PayrollAdjustments.CreatePayrollAdjustmentSchema);
  return adjustmentsService.create(user.tenantId, dto);
});
