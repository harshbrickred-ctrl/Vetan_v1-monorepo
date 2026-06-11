import {
  parseUuidParam,
  requirePlatformAuth,
  validateJson,
  withApi,
} from "@sangam/api-kit";
import { Billing } from "@sangam/contracts";
import * as entitlements from "@/server/platform/platform-feature-entitlements-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ tenantId: string }> };

export const GET = withApi(async (req, { params }: Ctx) => {
  await requirePlatformAuth(req);
  const { tenantId } = await params;
  return entitlements.getTenantFeatureEntitlements(
    parseUuidParam(tenantId, "tenantId"),
  );
});

export const PATCH = withApi(async (req, { params }: Ctx) => {
  await requirePlatformAuth(req);
  const { tenantId } = await params;
  const body = await validateJson(req, Billing.PatchFeatureEntitlementsSchema);
  entitlements.validateFeatureFlagKeys(body.featureFlags);
  return entitlements.updateTenantFeatureEntitlements(
    parseUuidParam(tenantId, "tenantId"),
    body.featureFlags,
  );
});
