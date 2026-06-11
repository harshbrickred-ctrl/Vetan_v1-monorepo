import { parseUuidParam, requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { Training } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as trainingService from "@/server/training/training-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export const POST = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "training");
  const { id } = await params;
  const dto = await validateJson(req, Training.EnrollEmployeeSchema);
  return trainingService.enroll(user.tenantId, parseUuidParam(id, "id"), dto);
});
