import { z } from "zod";

export const SUPPORT_CATEGORIES = [
  "GENERAL",
  "BILLING",
  "FEATURE_REQUEST",
  "TECHNICAL",
] as const;
export type SupportCategory = (typeof SUPPORT_CATEGORIES)[number];

export const SUPPORT_STATUSES = ["OPEN", "ACKNOWLEDGED", "RESOLVED"] as const;
export type SupportStatus = (typeof SUPPORT_STATUSES)[number];

export const CreatePlatformSupportRequestSchema = z.object({
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(4000),
  category: z.enum(SUPPORT_CATEGORIES).optional(),
});
export type CreatePlatformSupportRequestDto = z.infer<
  typeof CreatePlatformSupportRequestSchema
>;

export const UpdatePlatformSupportStatusSchema = z.object({
  status: z.enum(SUPPORT_STATUSES),
});
export type UpdatePlatformSupportStatusDto = z.infer<
  typeof UpdatePlatformSupportStatusSchema
>;
