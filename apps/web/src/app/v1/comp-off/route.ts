import { requireAuth, withApi } from "@sangam/api-kit";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as compOffService from "@/server/comp-off/comp-off-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["attendance:read"]);
  await requireFeature(user.tenantId, "compOff");
  return compOffService.listForTenant(user.tenantId);
});
