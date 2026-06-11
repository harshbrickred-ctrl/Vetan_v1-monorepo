import { requireAuth, withApi } from "@sangam/api-kit";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as orgChartService from "@/server/org/org-chart-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["employees:read"]);
  await requireFeature(user.tenantId, "orgChart");
  return orgChartService.getOrgChart(user.tenantId);
});
