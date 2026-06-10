import { parseUuidParam, withApi } from "@sangam/api-kit";
import { getLinkedEmployee } from "@/server/employee-portal/linked-employee";
import { visitorPhotoResponse } from "@/server/visitors/visitor-photo-response";
import * as visitorService from "@/server/visitors/visitor-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withApi(async (req, { params }: Ctx) => {
  const emp = await getLinkedEmployee(req);
  const { id } = await params;
  const visitorId = parseUuidParam(id, "id");
  const meta = await visitorService.resolvePhotoDownload(emp.tenantId, visitorId);
  return visitorPhotoResponse(req, meta);
});
