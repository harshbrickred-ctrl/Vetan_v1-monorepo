import { requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { Training } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as trainingService from "@/server/training/training-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:read"]);
  await requireFeature(user.tenantId, "training");
  return trainingService.listCourses(user.tenantId);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "training");
  const dto = await validateJson(req, Training.CreateCourseSchema);
  return trainingService.createCourse(user.tenantId, dto);
});
