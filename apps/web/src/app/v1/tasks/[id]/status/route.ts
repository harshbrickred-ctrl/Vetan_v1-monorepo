import {
  parseUuidParam,
  requireAuth,
  validateJson,
  withApi,
} from "@sangam/api-kit";
import { Tasks } from "@sangam/contracts";
import * as taskService from "@/server/tasks/task-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["tasks:write"]);
  const { id } = await params;
  const taskId = parseUuidParam(id, "id");
  const dto = await validateJson(req, Tasks.PatchAdminTaskStatusSchema);
  return taskService.updateAdminStatus(user.tenantId, taskId, dto.status);
});
