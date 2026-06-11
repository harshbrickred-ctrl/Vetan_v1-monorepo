import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const CreateLoanSchema = z.object({
  employeeId: z.string().uuid(),
  principal: z.coerce.number().positive(),
  emiAmount: z.coerce.number().positive(),
  startDate: isoDate,
});
export type CreateLoanDto = z.infer<typeof CreateLoanSchema>;

export const UpdateLoanSchema = z.object({
  balance: z.coerce.number().min(0).optional(),
  emiAmount: z.coerce.number().positive().optional(),
  status: z.enum(["ACTIVE", "CLOSED", "DEFAULTED"]).optional(),
});
export type UpdateLoanDto = z.infer<typeof UpdateLoanSchema>;
