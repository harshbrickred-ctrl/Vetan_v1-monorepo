import { z } from "zod";

export const CreateLeaveTypeSchema = z.object({
  code: z.string().min(1).max(16).regex(/^[A-Z0-9_]+$/),
  name: z.string().min(1).max(120),
  daysPerYear: z.coerce.number().int().min(0).max(365),
  carryForwardMax: z.coerce.number().int().min(0).max(365).optional(),
});
export type CreateLeaveTypeDto = z.infer<typeof CreateLeaveTypeSchema>;

export const UpdateLeaveTypeSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  daysPerYear: z.coerce.number().int().min(0).max(365).optional(),
  carryForwardMax: z.coerce.number().int().min(0).max(365).nullable().optional(),
});
export type UpdateLeaveTypeDto = z.infer<typeof UpdateLeaveTypeSchema>;
