import { z } from "zod";

export const CreatePolicySchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  version: z.string().min(1).max(32).optional(),
  publishedAt: z.string().datetime().optional(),
});
export type CreatePolicyDto = z.infer<typeof CreatePolicySchema>;

export const UpdatePolicySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).optional(),
  version: z.string().min(1).max(32).optional(),
  publishedAt: z.union([z.string().datetime(), z.null()]).optional(),
});
export type UpdatePolicyDto = z.infer<typeof UpdatePolicySchema>;
