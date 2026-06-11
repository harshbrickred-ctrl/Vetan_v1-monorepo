import { z } from "zod";

export const CreateRecognitionSchema = z.object({
  toId: z.string().uuid(),
  message: z.string().min(1).max(500),
});
export type CreateRecognitionDto = z.infer<typeof CreateRecognitionSchema>;
