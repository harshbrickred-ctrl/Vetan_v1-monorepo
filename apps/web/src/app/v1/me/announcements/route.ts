import { withApi } from "@sangam/api-kit";
import { requireFeature } from "@/server/tenant/feature-flags";
import { getLinkedEmployee } from "@/server/employee-portal/linked-employee";
import * as announcementsService from "@/server/announcements/announcements-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const emp = await getLinkedEmployee(req);
  await requireFeature(emp.tenantId, "announcements");
  return announcementsService.listFeed(emp.tenantId);
});
