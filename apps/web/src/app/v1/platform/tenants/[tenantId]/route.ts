import {
  parseUuidParam,
  requirePlatformAuth,
  withApi,
} from "@sangam/api-kit";
import * as telemetry from "@/server/platform/platform-telemetry-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ tenantId: string }> };

export const GET = withApi(async (req, { params }: Ctx) => {
  await requirePlatformAuth(req);
  const { tenantId } = await params;
  const row = await telemetry.getTenant(parseUuidParam(tenantId, "tenantId"));
  if (!row) return { found: false };
  return row;
});
