import { requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { SalaryComponents } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as salaryComponentsService from "@/server/salary/salary-components-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:read"]);
  await requireFeature(user.tenantId, "salaryComponentsAdmin");
  return salaryComponentsService.list(user.tenantId);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "salaryComponentsAdmin");
  const dto = await validateJson(req, SalaryComponents.CreateSalaryComponentSchema);
  return salaryComponentsService.create(user.tenantId, dto);
});
