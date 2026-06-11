import { z } from "zod";

export const CreatePayGroupSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  filterJson: z.record(z.string(), z.unknown()).optional(),
  employeeIds: z.array(z.string().uuid()).optional(),
});
export type CreatePayGroupDto = z.infer<typeof CreatePayGroupSchema>;

export const UpdatePayGroupSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullable().optional(),
  filterJson: z.record(z.string(), z.unknown()).nullable().optional(),
  employeeIds: z.array(z.string().uuid()).optional(),
});
export type UpdatePayGroupDto = z.infer<typeof UpdatePayGroupSchema>;
