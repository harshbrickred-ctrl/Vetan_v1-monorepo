import { BadRequestError, requireAuth, validateQuery, withApi } from "@sangam/api-kit";
import { Visitors } from "@sangam/contracts";
import * as visitorService from "@/server/visitors/visitor-service";
import { getLinkedEmployee } from "@/server/employee-portal/linked-employee";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["visitors:read"]);
  const query = await validateQuery(req, Visitors.ListVisitorsQuerySchema);
  return visitorService.listVisitors(user.tenantId, {
    search: query.search,
    visitToEmployeeId: query.visitToEmployeeId,
    from: query.from,
    to: query.to,
    limit: query.limit,
  });
});

export const POST = withApi(async (req) => {
  const user = await requireAuth(req, ["visitors:write"]);
  const emp = await getLinkedEmployee(req).catch(() => null);
  if (!emp) {
    throw new BadRequestError(
      "Admin accounts without a linked employee profile cannot register visitors. Use the employee portal.",
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new BadRequestError("Expected multipart form data");
  }

  const fileField = form.get("photo");
  const fieldsRaw = {
    name: form.get("name"),
    phone: form.get("phone"),
    purpose: form.get("purpose"),
    visitToName: form.get("visitToName"),
    visitToEmployeeId: form.get("visitToEmployeeId") || undefined,
    visitedAt: form.get("visitedAt"),
  };

  const parsed = Visitors.CreateVisitorFieldsSchema.safeParse({
    name: typeof fieldsRaw.name === "string" ? fieldsRaw.name : "",
    phone: typeof fieldsRaw.phone === "string" ? fieldsRaw.phone : "",
    purpose: typeof fieldsRaw.purpose === "string" ? fieldsRaw.purpose : "",
    visitToName: typeof fieldsRaw.visitToName === "string" ? fieldsRaw.visitToName : "",
    visitToEmployeeId:
      typeof fieldsRaw.visitToEmployeeId === "string" && fieldsRaw.visitToEmployeeId
        ? fieldsRaw.visitToEmployeeId
        : undefined,
    visitedAt: typeof fieldsRaw.visitedAt === "string" ? fieldsRaw.visitedAt : "",
  });
  if (!parsed.success) {
    throw new BadRequestError(parsed.error.issues.map((i) => i.message).join("; "));
  }

  if (!(fileField instanceof File) || fileField.size === 0) {
    throw new BadRequestError("Visitor photo is required");
  }

  const bytes = Buffer.from(await fileField.arrayBuffer());
  return visitorService.createVisitor(user.tenantId, emp.id, parsed.data, {
    fileName: fileField.name,
    mimeType: fileField.type || "image/jpeg",
    bytes,
    sizeBytes: bytes.length,
  });
});
