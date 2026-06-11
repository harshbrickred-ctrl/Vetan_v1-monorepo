import { parseUuidParam, requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { Announcements } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as announcementsService from "@/server/announcements/announcements-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "announcements");
  const { id } = await params;
  const dto = await validateJson(req, Announcements.UpdateAnnouncementSchema);
  return announcementsService.update(user.tenantId, parseUuidParam(id, "id"), dto);
});

export const DELETE = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "announcements");
  const { id } = await params;
  return announcementsService.remove(user.tenantId, parseUuidParam(id, "id"));
});
