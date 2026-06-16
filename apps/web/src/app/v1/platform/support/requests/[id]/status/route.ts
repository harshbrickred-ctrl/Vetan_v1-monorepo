import {
  parseUuidParam,
  requirePlatformAuth,
  validateJson,
  withApi,
} from "@sangam/api-kit";
import { PlatformSupport } from "@sangam/contracts";
import * as support from "@/server/support/platform-support-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withApi(async (req, { params }: Ctx) => {
  await requirePlatformAuth(req);
  const { id } = await params;
  const dto = await validateJson(req, PlatformSupport.UpdatePlatformSupportStatusSchema);
  return support.updateStatus(parseUuidParam(id, "id"), dto);
});
