import { parseUuidParam, requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { PolicyLibrary } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as policyService from "@/server/policies/policy-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "policyLibrary");
  const { id } = await params;
  const dto = await validateJson(req, PolicyLibrary.UpdatePolicySchema);
  return policyService.updatePolicy(user.tenantId, parseUuidParam(id, "id"), dto);
});

export const DELETE = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "policyLibrary");
  const { id } = await params;
  return policyService.deletePolicy(user.tenantId, parseUuidParam(id, "id"));
});
