import { prisma, Prisma } from "@sangam/db";
import { BadRequestError, NotFoundError } from "@sangam/api-kit";
import type { PayGroups } from "@sangam/contracts";

function mapRow(row: {
  id: string;
  name: string;
  description: string | null;
  filterJson: unknown;
  createdAt: Date;
  updatedAt: Date;
  members: Array<{
    employeeId: string;
    employee: {
      id: string;
      employeeCode: string;
      firstName: string;
      lastName: string;
    };
  }>;
}) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    filterJson: row.filterJson,
    memberCount: row.members.length,
    members: row.members.map((m) => ({
      employeeId: m.employeeId,
      employeeCode: m.employee.employeeCode,
      employeeName: `${m.employee.firstName} ${m.employee.lastName}`.trim(),
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const includeMembers = {
  members: {
    include: {
      employee: {
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  },
} as const;

async function assertEmployees(tenantId: string, employeeIds: string[]) {
  if (!employeeIds.length) return;
  const unique = [...new Set(employeeIds)];
  const found = await prisma.employee.count({
    where: { tenantId, deletedAt: null, id: { in: unique } },
  });
  if (found !== unique.length) {
    throw new BadRequestError("One or more employeeIds are invalid");
  }
}

async function syncMembers(payGroupId: string, employeeIds: string[]) {
  const unique = [...new Set(employeeIds)];
  await prisma.payGroupMember.deleteMany({ where: { payGroupId } });
  if (!unique.length) return;
  await prisma.payGroupMember.createMany({
    data: unique.map((employeeId) => ({ payGroupId, employeeId })),
    skipDuplicates: true,
  });
}

export async function list(tenantId: string) {
  const rows = await prisma.payGroup.findMany({
    where: { tenantId, deletedAt: null },
    orderBy: { name: "asc" },
    include: includeMembers,
  });
  return rows.map(mapRow);
}

export async function create(tenantId: string, dto: PayGroups.CreatePayGroupDto) {
  const employeeIds = dto.employeeIds ?? [];
  await assertEmployees(tenantId, employeeIds);

  const row = await prisma.$transaction(async (tx) => {
    const group = await tx.payGroup.create({
      data: {
        tenantId,
        name: dto.name.trim(),
        description: dto.description?.trim() ?? null,
        filterJson: dto.filterJson
          ? (dto.filterJson as Prisma.InputJsonValue)
          : undefined,
      },
    });
    if (employeeIds.length) {
      await tx.payGroupMember.createMany({
        data: employeeIds.map((employeeId) => ({
          payGroupId: group.id,
          employeeId,
        })),
        skipDuplicates: true,
      });
    }
    return tx.payGroup.findUniqueOrThrow({
      where: { id: group.id },
      include: includeMembers,
    });
  });

  return mapRow(row);
}

export async function update(
  tenantId: string,
  id: string,
  dto: PayGroups.UpdatePayGroupDto,
) {
  const existing = await prisma.payGroup.findFirst({
    where: { id, tenantId, deletedAt: null },
  });
  if (!existing) throw new NotFoundError("Pay group not found");

  if (dto.employeeIds) {
    await assertEmployees(tenantId, dto.employeeIds);
  }

  const row = await prisma.$transaction(async (tx) => {
    await tx.payGroup.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.filterJson !== undefined && {
          filterJson:
            dto.filterJson === null
              ? Prisma.JsonNull
              : (dto.filterJson as Prisma.InputJsonValue),
        }),
      },
    });
    if (dto.employeeIds) {
      await syncMembers(id, dto.employeeIds);
    }
    return tx.payGroup.findUniqueOrThrow({
      where: { id },
      include: includeMembers,
    });
  });

  return mapRow(row);
}

export async function softDelete(tenantId: string, id: string) {
  const row = await prisma.payGroup.findFirst({
    where: { id, tenantId, deletedAt: null },
  });
  if (!row) throw new NotFoundError("Pay group not found");

  const runCount = await prisma.payrollRun.count({
    where: { payGroupId: id },
  });
  if (runCount > 0) {
    throw new BadRequestError("Cannot archive pay group linked to payroll runs");
  }

  await prisma.payGroup.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return { deleted: true };
}
