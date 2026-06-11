import { z } from "zod";

export const CreateLegalEntitySchema = z.object({
  name: z.string().min(1).max(200),
  pan: z.string().max(10).optional(),
  gstin: z.string().max(15).optional(),
});
export type CreateLegalEntityDto = z.infer<typeof CreateLegalEntitySchema>;

export const UpdateLegalEntitySchema = CreateLegalEntitySchema.partial();
export type UpdateLegalEntityDto = z.infer<typeof UpdateLegalEntitySchema>;
