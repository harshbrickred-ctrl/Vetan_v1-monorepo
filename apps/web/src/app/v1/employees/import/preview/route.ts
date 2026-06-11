import { requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { BulkImportV2 } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as bulkPreview from "@/server/employees/bulk-import-preview";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["employees:write"]);
  await requireFeature(user.tenantId, "bulkImportV2");
  const dto = await validateJson(req, BulkImportV2.BulkImportPreviewSchema);
  return bulkPreview.previewBulkImport(user.tenantId, dto.rows);
});
