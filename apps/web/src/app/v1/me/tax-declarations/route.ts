import { validateJson, validateQuery, withApi } from "@sangam/api-kit";
import { TaxDeclarations } from "@sangam/contracts";
import { requireFeature } from "@/server/tenant/feature-flags";
import { getLinkedEmployee } from "@/server/employee-portal/linked-employee";
import * as taxService from "@/server/tax/tax-declarations-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const emp = await getLinkedEmployee(req);
  await requireFeature(emp.tenantId, "taxDeclarations");
  const q = await validateQuery(req, TaxDeclarations.GetTaxDeclarationQuerySchema);
  return taxService.getForEmployee(emp.id, q.year);
});

export const PUT = withApi(async (req) => {
  const emp = await getLinkedEmployee(req);
  await requireFeature(emp.tenantId, "taxDeclarations");
  const dto = await validateJson(req, TaxDeclarations.UpsertTaxDeclarationSchema);
  return taxService.upsertForEmployee(emp.id, dto);
});
