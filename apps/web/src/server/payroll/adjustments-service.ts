import { prisma } from "@sangam/db";
import { NotFoundError } from "@sangam/api-kit";
import type { PayrollAdjustments } from "@sangam/contracts";

function mapRow(row: {
  id: string;
  employeeId: string;
  payrollRunId: string | null;
  label: string;
  amount: { toString(): string };
  type: string;
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
    payrollRunId: row.payrollRunId,
    label: row.label,
    amount: Number(row.amount),
    type: row.type,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function list(tenantId: string) {
  const rows = await prisma.payrollAdjustment.findMany({
    where: { employee: { tenantId } },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      employee: { select: { employeeCode: true, firstName: true, lastName: true } },
    },
  });
  return rows.map(mapRow);
}

export async function create(tenantId: string, dto: PayrollAdjustments.CreatePayrollAdjustmentDto) {
  const emp = await prisma.employee.findFirst({
    where: { id: dto.employeeId, tenantId, deletedAt: null },
  });
  if (!emp) throw new NotFoundError("Employee not found");

  const row = await prisma.payrollAdjustment.create({
    data: {
      employeeId: dto.employeeId,
      label: dto.label.trim(),
      amount: dto.amount,
      type: dto.type,
      payrollRunId: dto.payrollRunId ?? null,
    },
    include: {
      employee: { select: { employeeCode: true, firstName: true, lastName: true } },
    },
  });
  return mapRow(row);
}
