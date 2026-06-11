import { prisma } from "@sangam/db";
import { BadRequestError, ConflictError, NotFoundError } from "@sangam/api-kit";
import type { LeaveTypes } from "@sangam/contracts";

function mapRow(row: {
  id: string;
  code: string;
  name: string;
  daysPerYear: number;
  carryForwardMax: number | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    daysPerYear: row.daysPerYear,
    carryForwardMax: row.carryForwardMax,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function list(tenantId: string) {
  const rows = await prisma.leaveType.findMany({
    where: { tenantId, deletedAt: null },
    orderBy: { name: "asc" },
  });
  return rows.map(mapRow);
}

export async function create(tenantId: string, dto: LeaveTypes.CreateLeaveTypeDto) {
  const code = dto.code.trim().toUpperCase();
  const existing = await prisma.leaveType.findUnique({
    where: { tenantId_code: { tenantId, code } },
  });
  if (existing && !existing.deletedAt) {
    throw new ConflictError("Leave type code already exists");
  }

  const row = await prisma.leaveType.create({
    data: {
      tenantId,
      code,
      name: dto.name.trim(),
      daysPerYear: dto.daysPerYear,
      carryForwardMax: dto.carryForwardMax ?? null,
    },
  });
  return mapRow(row);
}

export async function update(
  tenantId: string,
  id: string,
  dto: LeaveTypes.UpdateLeaveTypeDto,
) {
  const row = await prisma.leaveType.findFirst({
    where: { id, tenantId, deletedAt: null },
  });
  if (!row) throw new NotFoundError("Leave type not found");

  const updated = await prisma.leaveType.update({
    where: { id },
    data: {
      ...(dto.name !== undefined && { name: dto.name.trim() }),
      ...(dto.daysPerYear !== undefined && { daysPerYear: dto.daysPerYear }),
      ...(dto.carryForwardMax !== undefined && {
        carryForwardMax: dto.carryForwardMax,
      }),
    },
  });
  return mapRow(updated);
}

export async function softDelete(tenantId: string, id: string) {
  const row = await prisma.leaveType.findFirst({
    where: { id, tenantId, deletedAt: null },
  });
  if (!row) throw new NotFoundError("Leave type not found");

  const balanceCount = await prisma.leaveBalance.count({
    where: { leaveTypeId: id, balanceDays: { gt: 0 } },
  });
  if (balanceCount > 0) {
    throw new BadRequestError("Cannot archive leave type with active balances");
  }

  await prisma.leaveType.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return { deleted: true };
}
