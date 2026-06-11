import {
  parseUuidParam,
  requireAuth,
  validateJson,
  withApi,
} from "@sangam/api-kit";
import { SalaryComponents } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as salaryComponentsService from "@/server/salary/salary-components-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "salaryComponentsAdmin");
  const { id } = await params;
  const dto = await validateJson(req, SalaryComponents.UpdateSalaryComponentSchema);
  return salaryComponentsService.update(
    user.tenantId,
    parseUuidParam(id, "id"),
    dto,
  );
});

export const DELETE = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "salaryComponentsAdmin");
  const { id } = await params;
  return salaryComponentsService.remove(user.tenantId, parseUuidParam(id, "id"));
});
