import {
  parseUuidParam,
  requireAuth,
  validateJson,
  withApi,
} from "@sangam/api-kit";
import { SalaryStructures } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as salaryStructuresService from "@/server/salary/salary-structures-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:read"]);
  await requireFeature(user.tenantId, "salaryStructuresAdmin");
  const { id } = await params;
  return salaryStructuresService.getOne(user.tenantId, parseUuidParam(id, "id"));
});

export const PATCH = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "salaryStructuresAdmin");
  const { id } = await params;
  const dto = await validateJson(req, SalaryStructures.UpdateSalaryStructureSchema);
  return salaryStructuresService.update(
    user.tenantId,
    parseUuidParam(id, "id"),
    dto,
  );
});

export const DELETE = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "salaryStructuresAdmin");
  const { id } = await params;
  return salaryStructuresService.softDelete(
    user.tenantId,
    parseUuidParam(id, "id"),
  );
});
