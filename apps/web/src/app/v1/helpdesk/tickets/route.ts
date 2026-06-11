import { requireAuth, withApi } from "@sangam/api-kit";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as helpdeskService from "@/server/helpdesk/helpdesk-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:read"]);
  await requireFeature(user.tenantId, "helpdesk");
  return helpdeskService.listForTenant(user.tenantId);
});
