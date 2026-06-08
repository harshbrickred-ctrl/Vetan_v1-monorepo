import { NextResponse } from "next/server";
import { prisma } from "@sangam/db";
import { NotFoundError, withApi } from "@sangam/api-kit";
import * as idCardsService from "@/server/integrations/id-cards-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req, ctx: { params: Promise<{ employeeId: string }> }) => {
  const { employeeId } = await ctx.params;
  const key = new URL(req.url).searchParams.get("key");
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, deletedAt: null },
    select: { tenantId: true },
  });
  if (!employee) throw new NotFoundError("Employee not found");
  const resolved = await idCardsService.resolveEmployeePhoto(
    employee.tenantId,
    employeeId,
    key,
  );
  return NextResponse.redirect(resolved.url);
});
