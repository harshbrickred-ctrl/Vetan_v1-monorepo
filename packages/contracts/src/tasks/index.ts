import { z } from "zod";

const TASK_STATUSES = [
  "PENDING",
  "ACCEPTED",
  "WORKING",
  "DONE",
  "CANCELLED",
] as const;

const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH"] as const;

const EMPLOYEE_TASK_STATUSES = ["ACCEPTED", "WORKING", "DONE"] as const;

const ADMIN_TASK_STATUSES = ["DONE", "CANCELLED"] as const;

export const ListTasksQuerySchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  assigneeId: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
export type ListTasksQueryDto = z.infer<typeof ListTasksQuerySchema>;

export const CreateTaskSchema = z.object({
  assigneeId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
});
export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;

export const PatchAdminTaskStatusSchema = z.object({
  status: z.enum(ADMIN_TASK_STATUSES),
});
export type PatchAdminTaskStatusDto = z.infer<typeof PatchAdminTaskStatusSchema>;

export const PatchEmployeeTaskStatusSchema = z.object({
  status: z.enum(EMPLOYEE_TASK_STATUSES),
});
export type PatchEmployeeTaskStatusDto = z.infer<
  typeof PatchEmployeeTaskStatusSchema
>;
