import { z } from "zod";

export const CreatePayrollAdjustmentSchema = z.object({
  employeeId: z.string().uuid(),
  label: z.string().min(1).max(120),
  amount: z.coerce.number(),
  type: z.enum(["EARNING", "DEDUCTION"]),
  payrollRunId: z.string().uuid().optional(),
});
export type CreatePayrollAdjustmentDto = z.infer<typeof CreatePayrollAdjustmentSchema>;
