import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const LIFECYCLE_STAGES = [
  "PROBATION",
  "CONFIRMED",
  "NOTICE_PERIOD",
  "EXITED",
] as const;

export const UpdateEmployeeLifecycleSchema = z.object({
  lifecycleStage: z.enum(LIFECYCLE_STAGES).nullable().optional(),
  probationEndDate: z.union([isoDate, z.null()]).optional(),
  exitDate: z.union([isoDate, z.null()]).optional(),
  managerId: z.union([z.string().uuid(), z.null()]).optional(),
});
export type UpdateEmployeeLifecycleDto = z.infer<typeof UpdateEmployeeLifecycleSchema>;
