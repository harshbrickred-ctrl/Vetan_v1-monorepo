import { prisma } from "@sangam/db";

/** Standard leave types seeded for new workspaces (matches demo seed). */
export const DEFAULT_LEAVE_TYPES = [
  { code: "CL", name: "Casual Leave", daysPerYear: 12 },
  { code: "SL", name: "Sick Leave", daysPerYear: 10 },
  { code: "EL", name: "Earned Leave", daysPerYear: 18 },
] as const;

/**
 * Ensures the tenant has at least the default leave types (CL, SL, EL).
 * Idempotent — safe to call on every employee-portal leave action.
 */
export async function ensureTenantLeaveTypes(tenantId: string) {
  const existing = await prisma.leaveType.findMany({
    where: { tenantId, deletedAt: null },
    orderBy: { name: "asc" },
  });
  if (existing.length > 0) return existing;

  const created = [];
  for (const lt of DEFAULT_LEAVE_TYPES) {
    const row = await prisma.leaveType.create({
      data: {
        tenantId,
        code: lt.code,
        name: lt.name,
        daysPerYear: lt.daysPerYear,
      },
    });
    created.push(row);
  }
  return created;
}

/**
 * Creates missing leave-balance rows for the current year (full entitlement per type).
 * Does not overwrite existing balances so accruals/consumption stay intact.
 */
export async function ensureEmployeeLeaveBalances(
  employeeId: string,
  tenantId: string,
  year = new Date().getFullYear(),
) {
  const leaveTypes = await ensureTenantLeaveTypes(tenantId);

  for (const lt of leaveTypes) {
    const existing = await prisma.leaveBalance.findUnique({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId,
          leaveTypeId: lt.id,
          year,
        },
      },
    });
    if (existing) continue;

    await prisma.leaveBalance.create({
      data: {
        employeeId,
        leaveTypeId: lt.id,
        year,
        balanceDays: lt.daysPerYear,
      },
    });
  }
}
