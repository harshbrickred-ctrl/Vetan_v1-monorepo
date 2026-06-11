import { prisma, Prisma } from "@sangam/db";
import { BadRequestError, NotFoundError } from "@sangam/api-kit";
import type { SalaryStructures } from "@sangam/contracts";

type ComponentRow = {
  id: string;
  componentId: string;
  amount: Prisma.Decimal | null;
  percentOfBasic: Prisma.Decimal | null;
  sortOrder: number;
  component: { id: string; name: string; type: string; isTaxable: boolean };
};

function mapComponentLine(row: ComponentRow) {
  return {
    id: row.id,
    componentId: row.componentId,
    componentName: row.component.name,
    componentType: row.component.type,
    isTaxable: row.component.isTaxable,
    amount: row.amount != null ? Number(row.amount) : null,
    percentOfBasic:
      row.percentOfBasic != null ? Number(row.percentOfBasic) : null,
    sortOrder: row.sortOrder,
  };
}

function mapStructure(row: {
  id: string;
  name: string;
  description: string | null;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  components: ComponentRow[];
}) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isPublished: row.isPublished,
    components: row.components
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(mapComponentLine),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const structureInclude = {
  components: {
    include: {
      component: {
        select: { id: true, name: true, type: true, isTaxable: true },
      },
    },
  },
} as const;

async function assertComponents(
  tenantId: string,
  lines: SalaryStructures.StructureComponentLineDto[],
) {
  if (!lines.length) return;
  const ids = [...new Set(lines.map((l) => l.componentId))];
  const found = await prisma.salaryComponent.findMany({
    where: { tenantId, id: { in: ids } },
    select: { id: true },
  });
  if (found.length !== ids.length) {
    throw new BadRequestError("One or more componentIds are invalid");
  }
}

async function replaceComponents(
  structureId: string,
  lines: SalaryStructures.StructureComponentLineDto[],
) {
  await prisma.salaryStructureComponent.deleteMany({
    where: { structureId },
  });
  if (!lines.length) return;
  await prisma.salaryStructureComponent.createMany({
    data: lines.map((line, idx) => ({
      structureId,
      componentId: line.componentId,
      amount:
        line.amount !== undefined ? new Prisma.Decimal(line.amount) : null,
      percentOfBasic:
        line.percentOfBasic !== undefined
          ? new Prisma.Decimal(line.percentOfBasic)
          : null,
      sortOrder: line.sortOrder ?? idx,
    })),
  });
}

export async function list(tenantId: string) {
  const rows = await prisma.salaryStructure.findMany({
    where: { tenantId, deletedAt: null },
    orderBy: { name: "asc" },
    include: structureInclude,
  });
  return rows.map(mapStructure);
}

export async function getOne(tenantId: string, id: string) {
  const row = await prisma.salaryStructure.findFirst({
    where: { id, tenantId, deletedAt: null },
    include: structureInclude,
  });
  if (!row) throw new NotFoundError("Salary structure not found");
  return mapStructure(row);
}

export async function create(
  tenantId: string,
  dto: SalaryStructures.CreateSalaryStructureDto,
) {
  const lines = dto.components ?? [];
  await assertComponents(tenantId, lines);

  const row = await prisma.$transaction(async (tx) => {
    const structure = await tx.salaryStructure.create({
      data: {
        tenantId,
        name: dto.name.trim(),
        description: dto.description?.trim() ?? null,
        isPublished: dto.isPublished ?? false,
      },
    });
    if (lines.length) {
      await tx.salaryStructureComponent.createMany({
        data: lines.map((line, idx) => ({
          structureId: structure.id,
          componentId: line.componentId,
          amount:
            line.amount !== undefined ? new Prisma.Decimal(line.amount) : null,
          percentOfBasic:
            line.percentOfBasic !== undefined
              ? new Prisma.Decimal(line.percentOfBasic)
              : null,
          sortOrder: line.sortOrder ?? idx,
        })),
      });
    }
    return tx.salaryStructure.findUniqueOrThrow({
      where: { id: structure.id },
      include: structureInclude,
    });
  });

  return mapStructure(row);
}

export async function update(
  tenantId: string,
  id: string,
  dto: SalaryStructures.UpdateSalaryStructureDto,
) {
  const existing = await prisma.salaryStructure.findFirst({
    where: { id, tenantId, deletedAt: null },
  });
  if (!existing) throw new NotFoundError("Salary structure not found");

  if (dto.components) {
    await assertComponents(tenantId, dto.components);
  }

  const row = await prisma.$transaction(async (tx) => {
    await tx.salaryStructure.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name.trim() }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
        ...(dto.isPublished !== undefined && { isPublished: dto.isPublished }),
      },
    });
    if (dto.components) {
      await replaceComponents(id, dto.components);
    }
    return tx.salaryStructure.findUniqueOrThrow({
      where: { id },
      include: structureInclude,
    });
  });

  return mapStructure(row);
}

export async function softDelete(tenantId: string, id: string) {
  const row = await prisma.salaryStructure.findFirst({
    where: { id, tenantId, deletedAt: null },
  });
  if (!row) throw new NotFoundError("Salary structure not found");

  const assignmentCount = await prisma.salaryAssignment.count({
    where: { structureId: id },
  });
  if (assignmentCount > 0) {
    throw new BadRequestError(
      "Cannot archive structure with active salary assignments",
    );
  }

  await prisma.salaryStructure.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return { deleted: true };
}
