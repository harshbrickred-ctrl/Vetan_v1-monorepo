import { z } from "zod";

export const NotifyHostSchema = z.object({
  notify: z.boolean().optional(),
});
