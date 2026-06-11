import { z } from "zod";

export const CreateReimbursementSchema = z.object({
  category: z.string().min(1).max(80),
  amount: z.coerce.number().positive(),
  description: z.string().max(500).optional(),
  receiptRef: z.string().max(200).optional(),
});
export type CreateReimbursementDto = z.infer<typeof CreateReimbursementSchema>;

export const UpdateReimbursementStatusSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED", "PAID"]),
});
export type UpdateReimbursementStatusDto = z.infer<
  typeof UpdateReimbursementStatusSchema
>;
