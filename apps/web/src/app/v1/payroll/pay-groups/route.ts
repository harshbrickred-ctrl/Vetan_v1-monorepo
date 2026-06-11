import { requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { PayGroups } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as payGroupsService from "@/server/payroll/pay-groups-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["payroll:read"]);
  await requireFeature(user.tenantId, "payGroups");
  return payGroupsService.list(user.tenantId);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["payroll:run"]);
  await requireFeature(user.tenantId, "payGroups");
  const dto = await validateJson(req, PayGroups.CreatePayGroupSchema);
  return payGroupsService.create(user.tenantId, dto);
});
