import {
  parseUuidParam,
  requirePlatformAuth,
  validateJson,
  withApi,
} from "@sangam/api-kit";
import { Platform } from "@sangam/contracts";
import * as tenants from "@/server/platform/platform-tenants-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ tenantId: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  await requirePlatformAuth(req);
  const { tenantId } = await params;
  const dto = await validateJson(req, Platform.UpdateCompanyCodeSchema);
  return tenants.updateCompanyCode(
    parseUuidParam(tenantId, "tenantId"),
    dto.companyCode,
  );
});
