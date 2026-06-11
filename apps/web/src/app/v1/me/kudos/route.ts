import { validateJson, withApi } from "@sangam/api-kit";
import { Kudos } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import { getLinkedEmployee } from "@/server/employee-portal/linked-employee";
import * as kudosService from "@/server/kudos/kudos-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const emp = await getLinkedEmployee(req);
  await requireFeature(emp.tenantId, "kudos");
  return kudosService.listFeed(emp.tenantId);
});

export const POST = withApi(async (req) => {
  const emp = await getLinkedEmployee(req);
  await requireFeature(emp.tenantId, "kudos");
  const dto = await validateJson(req, Kudos.CreateRecognitionSchema);
  return kudosService.create(emp.tenantId, emp.id, dto);
});
