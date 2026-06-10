import { z } from "zod";

export const ListVisitorsQuerySchema = z.object({
  search: z.string().max(200).optional(),
  visitToEmployeeId: z.string().uuid().optional(),
  from: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  to: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
export type ListVisitorsQueryDto = z.infer<typeof ListVisitorsQuerySchema>;

export const CreateVisitorFieldsSchema = z.object({
  name: z.string().min(1).max(200),
  phone: z.string().min(6).max(20),
  purpose: z.string().min(1).max(1000),
  visitToName: z.string().min(1).max(200),
  visitToEmployeeId: z.string().uuid().optional(),
  visitedAt: z.string().min(1).max(40),
});
export type CreateVisitorFieldsDto = z.infer<typeof CreateVisitorFieldsSchema>;
