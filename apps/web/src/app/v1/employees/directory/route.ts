import { requireAuth, withApi } from "@sangam/api-kit";
import { requireFeature } from "@/server/tenant/feature-flags";
import * as directoryService from "@/server/employees/directory-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["employees:read"]);
  await requireFeature(user.tenantId, "employeeDirectory");
  const search = new URL(req.url).searchParams.get("search") ?? undefined;
  return directoryService.listDirectory(user.tenantId, search);
});
