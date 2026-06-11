import { requireAuth, withApi } from "@sangam/api-kit";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as kudosService from "@/server/kudos/kudos-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["employees:read"]);
  await requireFeature(user.tenantId, "kudos");
  return kudosService.listFeed(user.tenantId);
});
