import { requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { SalaryStructures } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as salaryStructuresService from "@/server/salary/salary-structures-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:read"]);
  await requireFeature(user.tenantId, "salaryStructuresAdmin");
  return salaryStructuresService.list(user.tenantId);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "salaryStructuresAdmin");
  const dto = await validateJson(req, SalaryStructures.CreateSalaryStructureSchema);
  return salaryStructuresService.create(user.tenantId, dto);
});
