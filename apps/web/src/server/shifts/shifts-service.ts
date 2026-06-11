import { prisma } from "@sangam/db";
import { ConflictError, NotFoundError } from "@sangam/api-kit";
import type { Shifts } from "@sangam/contracts";
import { parseISODateOnly } from "../shared/date-parse";

function mapShift(row: {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    name: row.name,
    startTime: row.startTime,
    endTime: row.endTime,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listShifts(tenantId: string) {
  const rows = await prisma.shift.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });
  return rows.map(mapShift);
}

export async function createShift(tenantId: string, dto: Shifts.CreateShiftDto) {
  const row = await prisma.shift.create({
    data: { tenantId, name: dto.name.trim(), startTime: dto.startTime, endTime: dto.endTime },
  });
  return mapShift(row);
}

export async function updateShift(tenantId: string, id: string, dto: Shifts.UpdateShiftDto) {
  const row = await prisma.shift.findFirst({ where: { id, tenantId } });
  if (!row) throw new NotFoundError("Shift not found");
  const updated = await prisma.shift.update({
    where: { id },
    data: {
      ...(dto.name !== undefined && { name: dto.name.trim() }),
      ...(dto.startTime !== undefined && { startTime: dto.startTime }),
      ...(dto.endTime !== undefined && { endTime: dto.endTime }),
    },
  });
  return mapShift(updated);
}

export async function deleteShift(tenantId: string, id: string) {
  const row = await prisma.shift.findFirst({ where: { id, tenantId } });
  if (!row) throw new NotFoundError("Shift not found");
  await prisma.shift.delete({ where: { id } });
  return { deleted: true };
}

export async function listRoster(tenantId: string, query: Shifts.ListRosterQueryDto) {
  const rows = await prisma.rosterAssignment.findMany({
    where: {
      shift: { tenantId },
      ...(query.employeeId ? { employeeId: query.employeeId } : {}),
      ...(query.from || query.to
        ? {
            date: {
              ...(query.from ? { gte: parseISODateOnly(query.from) } : {}),
              ...(query.to ? { lte: parseISODateOnly(query.to) } : {}),
            },
          }
        : {}),
    },
    include: {
      shift: { select: { id: true, name: true, startTime: true, endTime: true } },
      employee: {
        select: { id: true, employeeCode: true, firstName: true, lastName: true },
      },
    },
    orderBy: { date: "desc" },
    take: 200,
  });
  return rows.map((r) => ({
    id: r.id,
    date: r.date.toISOString().slice(0, 10),
    shift: r.shift,
    employee: {
      id: r.employee.id,
      employeeCode: r.employee.employeeCode,
      name: `${r.employee.firstName} ${r.employee.lastName}`.trim(),
    },
  }));
}

export async function createRoster(tenantId: string, dto: Shifts.CreateRosterAssignmentDto) {
  const shift = await prisma.shift.findFirst({ where: { id: dto.shiftId, tenantId } });
  if (!shift) throw new NotFoundError("Shift not found");
  const emp = await prisma.employee.findFirst({
    where: { id: dto.employeeId, tenantId, deletedAt: null },
  });
  if (!emp) throw new NotFoundError("Employee not found");

  try {
    const row = await prisma.rosterAssignment.create({
      data: {
        shiftId: dto.shiftId,
        employeeId: dto.employeeId,
        date: parseISODateOnly(dto.date),
      },
      include: {
        shift: { select: { id: true, name: true } },
        employee: { select: { employeeCode: true, firstName: true, lastName: true } },
      },
    });
    return {
      id: row.id,
      date: row.date.toISOString().slice(0, 10),
      shift: row.shift,
      employeeName: `${row.employee.firstName} ${row.employee.lastName}`.trim(),
      employeeCode: row.employee.employeeCode,
    };
  } catch {
    throw new ConflictError("Employee already has a roster assignment for this date");
  }
}

export async function deleteRoster(tenantId: string, id: string) {
  const row = await prisma.rosterAssignment.findFirst({
    where: { id, shift: { tenantId } },
  });
  if (!row) throw new NotFoundError("Roster assignment not found");
  await prisma.rosterAssignment.delete({ where: { id } });
  return { deleted: true };
}
