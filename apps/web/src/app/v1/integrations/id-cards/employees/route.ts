import { withApi } from "@sangam/api-kit";
import { requireIdCardIntegrationAuth } from "@/server/integrations/integration-auth";
import * as idCardsService from "@/server/integrations/id-cards-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export const GET = withApi(async (req) => {
  const { tenantId } = await requireIdCardIntegrationAuth(req);
  const auth = req.headers.get("authorization") ?? "";
  const apiKey = auth.replace(/^Bearer\s+/i, "").trim();
  return idCardsService.exportEmployeesForIdCards(tenantId, apiKey);
});
