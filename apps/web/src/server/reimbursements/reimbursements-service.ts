import { prisma } from "@sangam/db";
import { NotFoundError } from "@sangam/api-kit";
import type { Reimbursements } from "@sangam/contracts";

function mapRow(row: {
  id: string;
  employeeId: string;
  category: string;
  amount: { toString(): string };
  description: string | null;
  status: string;
  receiptRef: string | null;
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
    category: row.category,
    amount: Number(row.amount),
    description: row.description,
    status: row.status,
    receiptRef: row.receiptRef,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listForTenant(tenantId: string) {
  const rows = await prisma.reimbursementClaim.findMany({
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
  const rows = await prisma.reimbursementClaim.findMany({
    where: { tenantId, employeeId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapRow);
}

export async function create(
  tenantId: string,
  employeeId: string,
  dto: Reimbursements.CreateReimbursementDto,
) {
  const row = await prisma.reimbursementClaim.create({
    data: {
      tenantId,
      employeeId,
      category: dto.category.trim(),
      amount: dto.amount,
      description: dto.description?.trim() ?? null,
      receiptRef: dto.receiptRef?.trim() ?? null,
    },
  });
  return mapRow(row);
}

export async function updateStatus(
  tenantId: string,
  id: string,
  dto: Reimbursements.UpdateReimbursementStatusDto,
) {
  const row = await prisma.reimbursementClaim.findFirst({ where: { id, tenantId } });
  if (!row) throw new NotFoundError("Reimbursement claim not found");
  const updated = await prisma.reimbursementClaim.update({
    where: { id },
    data: { status: dto.status },
    include: {
      employee: { select: { employeeCode: true, firstName: true, lastName: true } },
    },
  });
  return mapRow(updated);
}
