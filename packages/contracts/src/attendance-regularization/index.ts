import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const CreateRegularizationSchema = z.object({
  date: isoDate,
  requestedIn: z.string().datetime().optional(),
  requestedOut: z.string().datetime().optional(),
  reason: z.string().min(1).max(500),
});
export type CreateRegularizationDto = z.infer<typeof CreateRegularizationSchema>;

export const UpdateRegularizationStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});
export type UpdateRegularizationStatusDto = z.infer<
  typeof UpdateRegularizationStatusSchema
>;
