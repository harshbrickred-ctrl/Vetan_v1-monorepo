import { NextResponse } from "next/server";
import {
  parseUuidParam,
  requirePlatformAuth,
  withApi,
} from "@sangam/api-kit";
import * as tenants from "@/server/platform/platform-tenants-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ tenantId: string; invoiceId: string }> };

export const GET = withApi(async (req, { params }: Ctx) => {
  await requirePlatformAuth(req);
  const { tenantId, invoiceId } = await params;
  const file = await tenants.getInvoiceDownload(
    parseUuidParam(tenantId, "tenantId"),
    parseUuidParam(invoiceId, "invoiceId"),
  );
  return new NextResponse(file.html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `attachment; filename="${file.filename}"`,
    },
  });
});
