import { z } from "zod";

export const AssignUserRolesSchema = z.object({
  roleIds: z.array(z.string().uuid()),
});
export type AssignUserRolesDto = z.infer<typeof AssignUserRolesSchema>;
