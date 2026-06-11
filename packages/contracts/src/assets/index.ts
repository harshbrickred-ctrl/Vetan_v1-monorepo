import { z } from "zod";

export const CreateAssetSchema = z.object({
  name: z.string().min(1).max(200),
  serialNo: z.string().max(120).optional(),
  category: z.string().max(80).optional(),
});
export type CreateAssetDto = z.infer<typeof CreateAssetSchema>;

export const AssignAssetSchema = z.object({
  employeeId: z.string().uuid(),
});
export type AssignAssetDto = z.infer<typeof AssignAssetSchema>;
