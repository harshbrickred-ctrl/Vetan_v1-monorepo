import { requireAuth, withApi } from "@sangam/api-kit";
import * as idCardsService from "@/server/integrations/id-cards-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["id-cards:read"]);
  return idCardsService.getIntegrationStatus(user.tenantId);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["id-cards:write"]);
  return idCardsService.generateIntegrationApiKey(user.tenantId, user.sub);
});

export const DELETE = withApi(async (req) => {
  const user = await requireAuth(req, ["id-cards:write"]);
  await idCardsService.revokeIntegrationApiKey(user.tenantId);
  return { revoked: true };
});
