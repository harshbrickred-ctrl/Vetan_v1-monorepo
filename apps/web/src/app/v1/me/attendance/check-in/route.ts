import { validateJson, withApi } from "@sangam/api-kit";
import { MobileCheckIn } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import { getLinkedEmployee } from "@/server/employee-portal/linked-employee";
import * as checkInService from "@/server/attendance/mobile-check-in-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = withApi(async (req) => {
  const emp = await getLinkedEmployee(req);
  await requireFeature(emp.tenantId, "mobileCheckIn");
  const dto = await validateJson(req, MobileCheckIn.MobileCheckInSchema);
  return checkInService.checkIn(emp.tenantId, emp.id, dto);
});
