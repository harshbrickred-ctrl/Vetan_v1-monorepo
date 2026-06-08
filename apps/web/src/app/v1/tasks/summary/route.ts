import { requireAuth, withApi } from "@sangam/api-kit";
import * as taskService from "@/server/tasks/task-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["tasks:read"]);
  return taskService.getSummary(user.tenantId);
});
