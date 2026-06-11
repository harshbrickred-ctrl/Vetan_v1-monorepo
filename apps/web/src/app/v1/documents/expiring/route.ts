import { requireAuth, validateQuery, withApi } from "@sangam/api-kit";
import { DocumentExpiry } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as documentExpiryService from "@/server/documents/document-expiry-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["employees:read"]);
  await requireFeature(user.tenantId, "documentExpiry");
  const q = await validateQuery(req, DocumentExpiry.ListExpiringDocumentsQuerySchema);
  return documentExpiryService.listExpiringSoon(user.tenantId, q.withinDays ?? 30);
});
