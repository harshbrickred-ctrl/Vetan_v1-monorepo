import { prisma } from "@sangam/db";
import { BadRequestError, NotFoundError } from "@sangam/api-kit";
import type { EmployeeLifecycle } from "@sangam/contracts";
import { parseISODateOnly } from "../shared/date-parse";

function mapLifecycle(row: {
  id: string;
  lifecycleStage: string | null;
  probationEndDate: Date | null;
  exitDate: Date | null;
  managerId: string | null;
}) {
  return {
    id: row.id,
    lifecycleStage: row.lifecycleStage,
    probationEndDate: row.probationEndDate?.toISOString().slice(0, 10) ?? null,
    exitDate: row.exitDate?.toISOString().slice(0, 10) ?? null,
    managerId: row.managerId,
  };
}

export async function updateLifecycle(
  tenantId: string,
  employeeId: string,
  dto: EmployeeLifecycle.UpdateEmployeeLifecycleDto,
) {
  const row = await prisma.employee.findFirst({
    where: { id: employeeId, tenantId, deletedAt: null },
  });
  if (!row) throw new NotFoundError("Employee not found");

  if (dto.managerId) {
    const mgr = await prisma.employee.findFirst({
      where: { id: dto.managerId, tenantId, deletedAt: null },
    });
    if (!mgr) throw new BadRequestError("Manager not found");
    if (dto.managerId === employeeId) {
      throw new BadRequestError("Employee cannot be their own manager");
    }
  }

  const updated = await prisma.employee.update({
    where: { id: employeeId },
    data: {
      ...(dto.lifecycleStage !== undefined && { lifecycleStage: dto.lifecycleStage }),
      ...(dto.probationEndDate !== undefined && {
        probationEndDate: dto.probationEndDate
          ? parseISODateOnly(dto.probationEndDate)
          : null,
      }),
      ...(dto.exitDate !== undefined && {
        exitDate: dto.exitDate ? parseISODateOnly(dto.exitDate) : null,
      }),
      ...(dto.managerId !== undefined && { managerId: dto.managerId }),
    },
    select: {
      id: true,
      lifecycleStage: true,
      probationEndDate: true,
      exitDate: true,
      managerId: true,
    },
  });
  return mapLifecycle(updated);
}
