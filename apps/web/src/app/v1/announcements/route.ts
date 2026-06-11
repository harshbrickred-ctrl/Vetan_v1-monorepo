import { requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { Announcements } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as announcementsService from "@/server/announcements/announcements-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:read"]);
  await requireFeature(user.tenantId, "announcements");
  return announcementsService.listFeed(user.tenantId);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "announcements");
  const dto = await validateJson(req, Announcements.CreateAnnouncementSchema);
  return announcementsService.create(user.tenantId, user.sub, dto);
});
