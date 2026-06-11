import { parseUuidParam, requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { CompOff } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as compOffService from "@/server/comp-off/comp-off-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["attendance:write"]);
  await requireFeature(user.tenantId, "compOff");
  const { id } = await params;
  const dto = await validateJson(req, CompOff.UpdateCompOffStatusSchema);
  return compOffService.updateStatus(user.tenantId, parseUuidParam(id, "id"), dto);
});
