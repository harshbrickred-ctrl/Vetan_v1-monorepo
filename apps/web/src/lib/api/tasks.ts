import { apiFetchJson } from "./client";

export type TaskStatus =
  | "PENDING"
  | "ACCEPTED"
  | "WORKING"
  | "DONE"
  | "CANCELLED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  acceptedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  assigneeId: string;
  assigneeName: string;
  assigneeCode: string;
  assigneeEmail: string;
  assignedById: string;
  assignedByName: string;
  assignedByEmail: string;
};

export type TaskSummary = {
  pending: number;
  accepted: number;
  working: number;
  done: number;
  cancelled: number;
  total: number;
};

export type CreateTaskPayload = {
  assigneeId: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority?: TaskPriority;
};

export async function fetchTasks(
  token: string,
  opts?: {
    status?: TaskStatus;
    assigneeId?: string;
    search?: string;
    limit?: number;
  },
) {
  const params = new URLSearchParams();
  if (opts?.status) params.set("status", opts.status);
  if (opts?.assigneeId) params.set("assigneeId", opts.assigneeId);
  if (opts?.search?.trim()) params.set("search", opts.search.trim());
  if (opts?.limit) params.set("limit", String(opts.limit));
  const q = params.toString();
  return apiFetchJson<TaskRow[]>(`/v1/tasks${q ? `?${q}` : ""}`, {
    method: "GET",
    token,
  });
}

export async function fetchTaskSummary(token: string) {
  return apiFetchJson<TaskSummary>("/v1/tasks/summary", {
    method: "GET",
    token,
  });
}

export async function createTask(token: string, payload: CreateTaskPayload) {
  return apiFetchJson<TaskRow>("/v1/tasks", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export async function patchAdminTaskStatus(
  token: string,
  taskId: string,
  status: "DONE" | "CANCELLED",
) {
  return apiFetchJson<TaskRow>(`/v1/tasks/${taskId}/status`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ status }),
  });
}
