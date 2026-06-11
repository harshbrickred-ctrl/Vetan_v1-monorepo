import { z } from "zod";

export const CreateTicketSchema = z.object({
  subject: z.string().min(1).max(200),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});
export type CreateTicketDto = z.infer<typeof CreateTicketSchema>;

export const CreateTicketCommentSchema = z.object({
  body: z.string().min(1).max(5000),
});
export type CreateTicketCommentDto = z.infer<typeof CreateTicketCommentSchema>;

export const UpdateTicketStatusSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
});
export type UpdateTicketStatusDto = z.infer<typeof UpdateTicketStatusSchema>;
