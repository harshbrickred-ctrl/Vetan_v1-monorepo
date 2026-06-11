import { z } from "zod";

export const SALARY_COMPONENT_TYPES = [
  "FIXED",
  "VARIABLE",
  "STATUTORY",
  "REIMBURSABLE",
] as const;

export const CreateSalaryComponentSchema = z.object({
  name: z.string().min(1).max(120),
  type: z.enum(SALARY_COMPONENT_TYPES),
  isTaxable: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});
export type CreateSalaryComponentDto = z.infer<typeof CreateSalaryComponentSchema>;

export const UpdateSalaryComponentSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  type: z.enum(SALARY_COMPONENT_TYPES).optional(),
  isTaxable: z.boolean().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
});
export type UpdateSalaryComponentDto = z.infer<typeof UpdateSalaryComponentSchema>;
