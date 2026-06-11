import {
  parseUuidParam,
  requireAuth,
  validateJson,
  withApi,
} from "@sangam/api-kit";
import { PayGroups } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as payGroupsService from "@/server/payroll/pay-groups-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["payroll:run"]);
  await requireFeature(user.tenantId, "payGroups");
  const { id } = await params;
  const dto = await validateJson(req, PayGroups.UpdatePayGroupSchema);
  return payGroupsService.update(user.tenantId, parseUuidParam(id, "id"), dto);
});

export const DELETE = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["payroll:run"]);
  await requireFeature(user.tenantId, "payGroups");
  const { id } = await params;
  return payGroupsService.softDelete(user.tenantId, parseUuidParam(id, "id"));
});
