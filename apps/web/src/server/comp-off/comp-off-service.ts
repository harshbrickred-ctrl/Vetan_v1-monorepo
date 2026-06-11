import { prisma } from "@sangam/db";
import { NotFoundError } from "@sangam/api-kit";
import type { CompOff } from "@sangam/contracts";

function mapRow(row: {
  id: string;
  employeeId: string;
  creditDays: { toString(): string };
  reason: string | null;
  status: string;
  createdAt: Date;
  employee?: { employeeCode: string; firstName: string; lastName: string };
}) {
  return {
    id: row.id,
    employeeId: row.employeeId,
    employeeName: row.employee
      ? `${row.employee.firstName} ${row.employee.lastName}`.trim()
      : undefined,
    employeeCode: row.employee?.employeeCode,
    creditDays: Number(row.creditDays),
    reason: row.reason,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listForTenant(tenantId: string) {
  const rows = await prisma.compOffCredit.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      employee: { select: { employeeCode: true, firstName: true, lastName: true } },
    },
  });
  return rows.map(mapRow);
}

export async function listForEmployee(tenantId: string, employeeId: string) {
  const rows = await prisma.compOffCredit.findMany({
    where: { tenantId, employeeId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapRow);
}

export async function create(
  tenantId: string,
  employeeId: string,
  dto: CompOff.CreateCompOffDto,
) {
  const row = await prisma.compOffCredit.create({
    data: {
      tenantId,
      employeeId,
      creditDays: dto.creditDays,
      reason: dto.reason?.trim() ?? null,
    },
  });
  return mapRow(row);
}

export async function updateStatus(
  tenantId: string,
  id: string,
  dto: CompOff.UpdateCompOffStatusDto,
) {
  const row = await prisma.compOffCredit.findFirst({ where: { id, tenantId } });
  if (!row) throw new NotFoundError("Comp-off request not found");
  const updated = await prisma.compOffCredit.update({
    where: { id },
    data: { status: dto.status },
    include: {
      employee: { select: { employeeCode: true, firstName: true, lastName: true } },
    },
  });
  return mapRow(updated);
}
