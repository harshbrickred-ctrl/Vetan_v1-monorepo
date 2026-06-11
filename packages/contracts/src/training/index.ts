import { z } from "zod";

export const CreateCourseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});
export type CreateCourseDto = z.infer<typeof CreateCourseSchema>;

export const EnrollEmployeeSchema = z.object({
  employeeId: z.string().uuid(),
});
export type EnrollEmployeeDto = z.infer<typeof EnrollEmployeeSchema>;

export const UpdateEnrollmentStatusSchema = z.object({
  status: z.enum(["ENROLLED", "IN_PROGRESS", "COMPLETED", "DROPPED"]),
});
export type UpdateEnrollmentStatusDto = z.infer<typeof UpdateEnrollmentStatusSchema>;
