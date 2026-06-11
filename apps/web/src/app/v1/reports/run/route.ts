import { NextResponse } from "next/server";
import { requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { Reports } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as reports from "@/server/reports/reports-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["reports:read"]);
  const dto = await validateJson(req, Reports.RunReportSchema);

  if (dto.format === "xlsx") {
    await requireFeature(user.tenantId, "reportExport");
  }

  const result = await reports.run(user.tenantId, dto);

  if (
    result &&
    typeof result === "object" &&
    "format" in result &&
    result.format === "xlsx"
  ) {
    return new NextResponse(new Uint8Array(result.buffer), {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${result.filename}"`,
      },
    });
  }

  return result;
});
