import { requireAuth, withApi } from "@sangam/api-kit";
import { getTenantFeatureFlags } from "@/server/tenant/feature-flags";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:read"]);
  return getTenantFeatureFlags(user.tenantId);
});
