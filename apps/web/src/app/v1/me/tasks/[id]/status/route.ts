import {
  parseUuidParam,
  validateJson,
  withApi,
} from "@sangam/api-kit";
import { Tasks } from "@sangam/contracts";
import { getLinkedEmployee } from "@/server/employee-portal/linked-employee";
import * as taskService from "@/server/tasks/task-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  const emp = await getLinkedEmployee(req);
  const { id } = await params;
  const taskId = parseUuidParam(id, "id");
  const dto = await validateJson(req, Tasks.PatchEmployeeTaskStatusSchema);
  return taskService.updateEmployeeStatus(
    emp.tenantId,
    emp.id,
    taskId,
    dto.status,
  );
});
