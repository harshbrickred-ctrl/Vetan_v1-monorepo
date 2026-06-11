import { requireAuth, withApi } from "@sangam/api-kit";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as regService from "@/server/attendance/regularization-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["attendance:read"]);
  await requireFeature(user.tenantId, "attendanceRegularization");
  const status = new URL(req.url).searchParams.get("status") ?? undefined;
  return regService.listForTenant(user.tenantId, status);
});
