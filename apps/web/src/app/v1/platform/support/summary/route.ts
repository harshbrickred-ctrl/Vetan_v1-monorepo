import { parseUuidParam, requirePlatformAuth, withApi } from "@sangam/api-kit";
import * as support from "@/server/support/platform-support-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  await requirePlatformAuth(req);
  const open = await support.countOpenForPlatform();
  return { open };
});
