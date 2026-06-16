import { prisma } from "@sangam/db";
import { requireAuth, validateJson, withApi } from "@sangam/api-kit";
import { PlatformSupport } from "@sangam/contracts";
import * as support from "@/server/support/platform-support-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req);
  const isAdmin = user.roles.includes("ADMIN");
  return support.listForTenant(user.tenantId, user.sub, isAdmin);
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req);
  const dto = await validateJson(req, PlatformSupport.CreatePlatformSupportRequestSchema);
  const dbUser = await prisma.user.findUnique({
    where: { id: user.sub },
    select: { name: true, email: true },
  });
  return support.createRequest(
    user.tenantId,
    user,
    dbUser?.name ?? user.email,
    dto,
  );
});
