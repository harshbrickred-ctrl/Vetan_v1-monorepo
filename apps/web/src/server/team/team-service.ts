import { prisma } from "@sangam/db";
import type { LinkedEmployeeContext } from "@/server/employee-portal/linked-employee";

async function directReportIds(managerId: string, tenantId: string) {
  const reports = await prisma.employee.findMany({
    where: { managerId, tenantId, deletedAt: null },
    select: { id: true },
  });
  return reports.map((r) => r.id);
}

export async function listDirectReports(emp: LinkedEmployeeContext) {
  const rows = await prisma.employee.findMany({
    where: {
      managerId: emp.id,
      tenantId: emp.tenantId,
      deletedAt: null,
    },
    orderBy: { firstName: "asc" },
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      email: true,
      status: true,
      department: { select: { name: true } },
      designation: { select: { title: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    employeeCode: r.employeeCode,
    name: `${r.firstName} ${r.lastName}`.trim(),
    email: r.email,
    status: r.status,
    department: r.department?.name ?? null,
    designation: r.designation?.title ?? null,
  }));
}

export async function listTeamLeaveRequests(emp: LinkedEmployeeContext) {
  const ids = await directReportIds(emp.id, emp.tenantId);
  if (!ids.length) return [];

  const rows = await prisma.leaveRequest.findMany({
    where: { tenantId: emp.tenantId, employeeId: { in: ids } },
    orderBy: { createdAt: "desc" },
    include: {
      employee: {
        select: { employeeCode: true, firstName: true, lastName: true },
      },
      leaveType: { select: { name: true, code: true } },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    employeeId: r.employeeId,
    employeeCode: r.employee.employeeCode,
    employeeName: `${r.employee.firstName} ${r.employee.lastName}`.trim(),
    leaveType: r.leaveType.name,
    leaveTypeCode: r.leaveType.code,
    startDate: r.startDate.toISOString().slice(0, 10),
    endDate: r.endDate.toISOString().slice(0, 10),
    workingDays: Number(r.workingDays),
    status: r.status,
    reason: r.reason,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function listTeamAttendance(
  emp: LinkedEmployeeContext,
  opts: { from?: string; to?: string } = {},
) {
  const ids = await directReportIds(emp.id, emp.tenantId);
  if (!ids.length) return [];

  const dateFilter =
    opts.from || opts.to
      ? {
          ...(opts.from ? { gte: new Date(opts.from) } : {}),
          ...(opts.to ? { lte: new Date(opts.to) } : {}),
        }
      : undefined;

  const rows = await prisma.attendanceRecord.findMany({
    where: {
      tenantId: emp.tenantId,
      employeeId: { in: ids },
      ...(dateFilter ? { date: dateFilter } : {}),
    },
    orderBy: [{ date: "desc" }, { employeeId: "asc" }],
    include: {
      employee: {
        select: { employeeCode: true, firstName: true, lastName: true },
      },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    employeeId: r.employeeId,
    employeeCode: r.employee.employeeCode,
    employeeName: `${r.employee.firstName} ${r.employee.lastName}`.trim(),
    date: r.date.toISOString().slice(0, 10),
    status: r.status,
    checkIn: r.checkIn?.toISOString() ?? null,
    checkOut: r.checkOut?.toISOString() ?? null,
    source: r.source,
  }));
}
