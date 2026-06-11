import { z } from "zod";

export const ListExpiringDocumentsQuerySchema = z.object({
  withinDays: z.coerce.number().int().min(1).max(365).optional(),
});
export type ListExpiringDocumentsQueryDto = z.infer<
  typeof ListExpiringDocumentsQuerySchema
>;
