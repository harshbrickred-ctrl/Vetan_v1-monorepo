import { prisma, Prisma } from "@sangam/db";
import { BadRequestError, NotFoundError } from "@sangam/api-kit";
import type { SalaryComponents } from "@sangam/contracts";

function mapRow(row: {
  id: string;
  name: string;
  type: string;
  isTaxable: boolean;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    isTaxable: row.isTaxable,
    metadata: row.metadata,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function list(tenantId: string) {
  const rows = await prisma.salaryComponent.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });
  return rows.map(mapRow);
}

export async function create(
  tenantId: string,
  dto: SalaryComponents.CreateSalaryComponentDto,
) {
  const row = await prisma.salaryComponent.create({
    data: {
      tenantId,
      name: dto.name.trim(),
      type: dto.type,
      isTaxable: dto.isTaxable ?? true,
      metadata: dto.metadata
        ? (dto.metadata as Prisma.InputJsonValue)
        : undefined,
    },
  });
  return mapRow(row);
}

export async function update(
  tenantId: string,
  id: string,
  dto: SalaryComponents.UpdateSalaryComponentDto,
) {
  const row = await prisma.salaryComponent.findFirst({
    where: { id, tenantId },
  });
  if (!row) throw new NotFoundError("Salary component not found");

  const updated = await prisma.salaryComponent.update({
    where: { id },
    data: {
      ...(dto.name !== undefined && { name: dto.name.trim() }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.isTaxable !== undefined && { isTaxable: dto.isTaxable }),
      ...(dto.metadata !== undefined && {
        metadata:
          dto.metadata === null
            ? Prisma.JsonNull
            : (dto.metadata as Prisma.InputJsonValue),
      }),
    },
  });
  return mapRow(updated);
}

export async function remove(tenantId: string, id: string) {
  const row = await prisma.salaryComponent.findFirst({
    where: { id, tenantId },
  });
  if (!row) throw new NotFoundError("Salary component not found");

  const inUse = await prisma.salaryStructureComponent.count({
    where: { componentId: id },
  });
  if (inUse > 0) {
    throw new BadRequestError(
      "Cannot delete component used in salary structures",
    );
  }

  await prisma.salaryComponent.delete({ where: { id } });
  return { deleted: true };
}
