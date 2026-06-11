import { z } from "zod";

export const MobileCheckInSchema = z.object({
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  note: z.string().max(200).optional(),
});
export type MobileCheckInDto = z.infer<typeof MobileCheckInSchema>;
