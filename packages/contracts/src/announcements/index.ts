import { z } from "zod";

export const CreateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1),
  pinned: z.boolean().optional(),
});
export type CreateAnnouncementDto = z.infer<typeof CreateAnnouncementSchema>;

export const UpdateAnnouncementSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  body: z.string().min(1).optional(),
  pinned: z.boolean().optional(),
});
export type UpdateAnnouncementDto = z.infer<typeof UpdateAnnouncementSchema>;
