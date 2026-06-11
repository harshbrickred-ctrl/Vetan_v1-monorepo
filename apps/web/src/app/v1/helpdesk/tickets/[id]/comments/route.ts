import { parseUuidParam, requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { Helpdesk } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as helpdeskService from "@/server/helpdesk/helpdesk-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const GET = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:read"]);
  await requireFeature(user.tenantId, "helpdesk");
  const { id } = await params;
  return helpdeskService.listComments(user.tenantId, parseUuidParam(id, "id"));
});

export const POST = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:read"]);
  await requireFeature(user.tenantId, "helpdesk");
  const { id } = await params;
  const dto = await validateJson(req, Helpdesk.CreateTicketCommentSchema);
  return helpdeskService.addComment(user.tenantId, parseUuidParam(id, "id"), user.sub, dto);
});
