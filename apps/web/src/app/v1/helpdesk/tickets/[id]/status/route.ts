import { parseUuidParam, requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { Helpdesk } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as helpdeskService from "@/server/helpdesk/helpdesk-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "helpdesk");
  const { id } = await params;
  const dto = await validateJson(req, Helpdesk.UpdateTicketStatusSchema);
  return helpdeskService.updateStatus(user.tenantId, parseUuidParam(id, "id"), dto);
});
