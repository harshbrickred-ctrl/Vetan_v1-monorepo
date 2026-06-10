import { parseUuidParam, requireAuth, withApi } from "@sangam/api-kit";
import { visitorPhotoResponse } from "@/server/visitors/visitor-photo-response";
import * as visitorService from "@/server/visitors/visitor-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["visitors:read"]);
  const { id } = await params;
  const visitorId = parseUuidParam(id, "id");
  const meta = await visitorService.resolvePhotoDownload(user.tenantId, visitorId);
  return visitorPhotoResponse(req, meta);
});
