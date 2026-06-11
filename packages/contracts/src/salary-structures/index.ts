import { z } from "zod";

export const StructureComponentLineSchema = z.object({
  componentId: z.string().uuid(),
  amount: z.coerce.number().min(0).optional(),
  percentOfBasic: z.coerce.number().min(0).max(100).optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});
export type StructureComponentLineDto = z.infer<typeof StructureComponentLineSchema>;

export const CreateSalaryStructureSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional(),
  isPublished: z.boolean().optional(),
  components: z.array(StructureComponentLineSchema).optional(),
});
export type CreateSalaryStructureDto = z.infer<typeof CreateSalaryStructureSchema>;

export const UpdateSalaryStructureSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).nullable().optional(),
  isPublished: z.boolean().optional(),
  components: z.array(StructureComponentLineSchema).optional(),
});
export type UpdateSalaryStructureDto = z.infer<typeof UpdateSalaryStructureSchema>;
