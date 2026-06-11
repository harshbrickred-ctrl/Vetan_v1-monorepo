import { prisma } from "@sangam/db";
import { NotFoundError } from "@sangam/api-kit";
import type { LegalEntities } from "@sangam/contracts";

function mapRow(row: {
  id: string;
  name: string;
  pan: string | null;
  gstin: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    name: row.name,
    pan: row.pan,
    gstin: row.gstin,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function list(tenantId: string) {
  const rows = await prisma.legalEntity.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
  });
  return rows.map(mapRow);
}

export async function create(tenantId: string, dto: LegalEntities.CreateLegalEntityDto) {
  const row = await prisma.legalEntity.create({
    data: {
      tenantId,
      name: dto.name.trim(),
      pan: dto.pan?.trim().toUpperCase() ?? null,
      gstin: dto.gstin?.trim().toUpperCase() ?? null,
    },
  });
  return mapRow(row);
}

export async function update(
  tenantId: string,
  id: string,
  dto: LegalEntities.UpdateLegalEntityDto,
) {
  const row = await prisma.legalEntity.findFirst({ where: { id, tenantId } });
  if (!row) throw new NotFoundError("Legal entity not found");
  const updated = await prisma.legalEntity.update({
    where: { id },
    data: {
      ...(dto.name !== undefined && { name: dto.name.trim() }),
      ...(dto.pan !== undefined && { pan: dto.pan?.trim().toUpperCase() ?? null }),
      ...(dto.gstin !== undefined && { gstin: dto.gstin?.trim().toUpperCase() ?? null }),
    },
  });
  return mapRow(updated);
}

export async function remove(tenantId: string, id: string) {
  const row = await prisma.legalEntity.findFirst({ where: { id, tenantId } });
  if (!row) throw new NotFoundError("Legal entity not found");
  await prisma.legalEntity.delete({ where: { id } });
  return { deleted: true };
}
