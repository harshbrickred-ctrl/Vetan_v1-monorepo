import { z } from "zod";

export const CreateCompOffSchema = z.object({
  creditDays: z.coerce.number().min(0.5).max(30),
  reason: z.string().max(500).optional(),
});
export type CreateCompOffDto = z.infer<typeof CreateCompOffSchema>;

export const UpdateCompOffStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
});
export type UpdateCompOffStatusDto = z.infer<typeof UpdateCompOffStatusSchema>;
