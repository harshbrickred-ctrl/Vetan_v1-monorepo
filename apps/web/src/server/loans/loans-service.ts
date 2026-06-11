import { prisma } from "@sangam/db";
import { NotFoundError } from "@sangam/api-kit";
import type { Loans } from "@sangam/contracts";
import { parseISODateOnly } from "../shared/date-parse";

function mapRow(row: {
  id: string;
  employeeId: string;
  principal: { toString(): string };
  balance: { toString(): string };
  emiAmount: { toString(): string };
  startDate: Date;
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
    principal: Number(row.principal),
    balance: Number(row.balance),
    emiAmount: Number(row.emiAmount),
    startDate: row.startDate.toISOString().slice(0, 10),
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function list(tenantId: string) {
  const rows = await prisma.employeeLoan.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    include: {
      employee: { select: { employeeCode: true, firstName: true, lastName: true } },
    },
  });
  return rows.map(mapRow);
}

export async function create(tenantId: string, dto: Loans.CreateLoanDto) {
  const emp = await prisma.employee.findFirst({
    where: { id: dto.employeeId, tenantId, deletedAt: null },
  });
  if (!emp) throw new NotFoundError("Employee not found");

  const row = await prisma.employeeLoan.create({
    data: {
      tenantId,
      employeeId: dto.employeeId,
      principal: dto.principal,
      balance: dto.principal,
      emiAmount: dto.emiAmount,
      startDate: parseISODateOnly(dto.startDate),
    },
    include: {
      employee: { select: { employeeCode: true, firstName: true, lastName: true } },
    },
  });
  return mapRow(row);
}

export async function update(tenantId: string, id: string, dto: Loans.UpdateLoanDto) {
  const row = await prisma.employeeLoan.findFirst({ where: { id, tenantId } });
  if (!row) throw new NotFoundError("Loan not found");
  const updated = await prisma.employeeLoan.update({
    where: { id },
    data: {
      ...(dto.balance !== undefined && { balance: dto.balance }),
      ...(dto.emiAmount !== undefined && { emiAmount: dto.emiAmount }),
      ...(dto.status !== undefined && { status: dto.status }),
    },
    include: {
      employee: { select: { employeeCode: true, firstName: true, lastName: true } },
    },
  });
  return mapRow(updated);
}
