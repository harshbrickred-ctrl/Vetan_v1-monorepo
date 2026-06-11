import { UnauthorizedError, withApi } from "@sangam/api-kit";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as documentExpiryService from "@/server/documents/document-expiry-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorisedCron(req: Request): boolean {
  if (req.headers.get("x-vercel-cron")) return true;
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") === `Bearer ${secret}`) return true;
  return false;
}

export const GET = withApi(async (req) => {
  if (!isAuthorisedCron(req)) {
    throw new UnauthorizedError("Cron credentials required");
  }
  const tenantId = new URL(req.url).searchParams.get("tenantId") ?? undefined;
  if (tenantId) {
    await requireFeature(tenantId, "documentExpiry");
  }
  return documentExpiryService.runExpiryScan(tenantId ?? undefined);
});
