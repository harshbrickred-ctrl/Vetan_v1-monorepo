import { z } from "zod";

export const UpsertTaxDeclarationSchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
  regime: z.enum(["OLD", "NEW"]).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
});
export type UpsertTaxDeclarationDto = z.infer<typeof UpsertTaxDeclarationSchema>;

export const GetTaxDeclarationQuerySchema = z.object({
  year: z.coerce.number().int().min(2000).max(2100),
});
export type GetTaxDeclarationQueryDto = z.infer<typeof GetTaxDeclarationQuerySchema>;
