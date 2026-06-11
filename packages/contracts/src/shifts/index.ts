import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const timeStr = z.string().regex(/^\d{2}:\d{2}$/);

export const CreateShiftSchema = z.object({
  name: z.string().min(1).max(120),
  startTime: timeStr,
  endTime: timeStr,
});
export type CreateShiftDto = z.infer<typeof CreateShiftSchema>;

export const UpdateShiftSchema = CreateShiftSchema.partial();
export type UpdateShiftDto = z.infer<typeof UpdateShiftSchema>;

export const CreateRosterAssignmentSchema = z.object({
  shiftId: z.string().uuid(),
  employeeId: z.string().uuid(),
  date: isoDate,
});
export type CreateRosterAssignmentDto = z.infer<typeof CreateRosterAssignmentSchema>;

export const ListRosterQuerySchema = z.object({
  from: isoDate.optional(),
  to: isoDate.optional(),
  employeeId: z.string().uuid().optional(),
});
export type ListRosterQueryDto = z.infer<typeof ListRosterQuerySchema>;
