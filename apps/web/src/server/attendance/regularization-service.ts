import { prisma } from "@sangam/db";
import { NotFoundError } from "@sangam/api-kit";
import type { AttendanceRegularization } from "@sangam/contracts";
import { parseISODateOnly } from "../shared/date-parse";

function mapRow(row: {
  id: string;
  employeeId: string;
  date: Date;
  requestedIn: Date | null;
  requestedOut: Date | null;
  reason: string;
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
    date: row.date.toISOString().slice(0, 10),
    requestedIn: row.requestedIn?.toISOString() ?? null,
    requestedOut: row.requestedOut?.toISOString() ?? null,
    reason: row.reason,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listForTenant(tenantId: string, status?: string) {
  const rows = await prisma.attendanceRegularization.findMany({
    where: { tenantId, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      employee: { select: { employeeCode: true, firstName: true, lastName: true } },
    },
  });
  return rows.map(mapRow);
}

export async function listForEmployee(tenantId: string, employeeId: string) {
  const rows = await prisma.attendanceRegularization.findMany({
    where: { tenantId, employeeId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return rows.map(mapRow);
}

export async function create(
  tenantId: string,
  employeeId: string,
  dto: AttendanceRegularization.CreateRegularizationDto,
) {
  const row = await prisma.attendanceRegularization.create({
    data: {
      tenantId,
      employeeId,
      date: parseISODateOnly(dto.date),
      requestedIn: dto.requestedIn ? new Date(dto.requestedIn) : null,
      requestedOut: dto.requestedOut ? new Date(dto.requestedOut) : null,
      reason: dto.reason.trim(),
    },
  });
  return mapRow(row);
}

export async function updateStatus(
  tenantId: string,
  id: string,
  dto: AttendanceRegularization.UpdateRegularizationStatusDto,
) {
  const row = await prisma.attendanceRegularization.findFirst({
    where: { id, tenantId },
  });
  if (!row) throw new NotFoundError("Regularization request not found");
  const updated = await prisma.attendanceRegularization.update({
    where: { id },
    data: { status: dto.status },
    include: {
      employee: { select: { employeeCode: true, firstName: true, lastName: true } },
    },
  });
  return mapRow(updated);
}
