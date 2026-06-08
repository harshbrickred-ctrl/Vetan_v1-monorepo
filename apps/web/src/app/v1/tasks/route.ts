import { requireAuth, validateJson, validateQuery, withApi } from "@sangam/api-kit";
import { Tasks } from "@sangam/contracts";
import * as taskService from "@/server/tasks/task-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["tasks:read"]);
  const query = await validateQuery(req, Tasks.ListTasksQuerySchema);
  return taskService.listTasks(user.tenantId, {
    status: query.status,
    assigneeId: query.assigneeId,
    search: query.search,
    limit: query.limit,
  });
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["tasks:write"]);
  const dto = await validateJson(req, Tasks.CreateTaskSchema);
  return taskService.createTask(user.tenantId, user.sub, dto);
});
