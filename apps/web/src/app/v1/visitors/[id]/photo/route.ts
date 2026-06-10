import { NextResponse } from "next/server";
import { parseUuidParam, requireAuth, withApi } from "@sangam/api-kit";
import * as visitorService from "@/server/visitors/visitor-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["visitors:read"]);
  const { id } = await params;
  const visitorId = parseUuidParam(id, "id");
  const meta = await visitorService.resolvePhotoDownload(user.tenantId, visitorId);

  return NextResponse.redirect(new URL(meta.url, req.url), {
    status: 302,
    headers: {
      "Content-Disposition": `inline; filename="${encodeURIComponent(meta.fileName)}"`,
    },
  });
});
