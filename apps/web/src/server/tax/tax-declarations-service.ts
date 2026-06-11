import { prisma, Prisma } from "@sangam/db";
import type { TaxDeclarations } from "@sangam/contracts";

function mapRow(row: {
  id: string;
  employeeId: string;
  year: number;
  regime: string;
  payload: unknown;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    employeeId: row.employeeId,
    year: row.year,
    regime: row.regime,
    payload: row.payload,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function getForEmployee(employeeId: string, year: number) {
  const row = await prisma.taxDeclaration.findUnique({
    where: { employeeId_year: { employeeId, year } },
  });
  if (!row) return null;
  return mapRow(row);
}

export async function upsertForEmployee(
  employeeId: string,
  dto: TaxDeclarations.UpsertTaxDeclarationDto,
) {
  const row = await prisma.taxDeclaration.upsert({
    where: { employeeId_year: { employeeId, year: dto.year } },
    create: {
      employeeId,
      year: dto.year,
      regime: dto.regime ?? "NEW",
      payload: (dto.payload ?? {}) as Prisma.InputJsonValue,
    },
    update: {
      ...(dto.regime !== undefined && { regime: dto.regime }),
      ...(dto.payload !== undefined && {
        payload: dto.payload as Prisma.InputJsonValue,
      }),
    },
  });
  return mapRow(row);
}
