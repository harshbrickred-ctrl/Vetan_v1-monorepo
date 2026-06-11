import {
  parseUuidParam,
  requireAuth,
  validateJson,
  withApi,
} from "@sangam/api-kit";
import { Users } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as usersService from "@/server/users/users-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  const user = await requireAuth(req, ["settings:write"]);
  await requireFeature(user.tenantId, "granularRbac");
  const { id } = await params;
  const dto = await validateJson(req, Users.AssignUserRolesSchema);
  return usersService.assignRoles(
    user.tenantId,
    parseUuidParam(id, "id"),
    dto,
  );
});
