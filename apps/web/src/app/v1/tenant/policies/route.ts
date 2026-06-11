import { requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { PolicyLibrary } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as policyService from "@/server/policies/policy-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:read"]);
  await requireFeature(user.tenantId, "policyLibrary");
  return policyService.listPolicies(user.tenantId);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "policyLibrary");
  const dto = await validateJson(req, PolicyLibrary.CreatePolicySchema);
  return policyService.createPolicy(user.tenantId, dto);
});
