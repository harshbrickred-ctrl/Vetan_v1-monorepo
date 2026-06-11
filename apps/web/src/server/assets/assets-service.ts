import { prisma } from "@sangam/db";
import { NotFoundError } from "@sangam/api-kit";
import type { Assets } from "@sangam/contracts";

export async function list(tenantId: string) {
  const rows = await prisma.asset.findMany({
    where: { tenantId },
    orderBy: { name: "asc" },
    include: {
      assignments: {
        where: { returnedAt: null },
        take: 1,
        include: {
          employee: {
            select: { id: true, firstName: true, lastName: true, employeeCode: true },
          },
        },
      },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    serialNo: r.serialNo,
    category: r.category,
    createdAt: r.createdAt.toISOString(),
    currentAssignee: r.assignments[0]
      ? {
          employeeId: r.assignments[0].employee.id,
          name: `${r.assignments[0].employee.firstName} ${r.assignments[0].employee.lastName}`.trim(),
          employeeCode: r.assignments[0].employee.employeeCode,
          assignedAt: r.assignments[0].assignedAt.toISOString(),
        }
      : null,
  }));
}

export async function create(tenantId: string, dto: Assets.CreateAssetDto) {
  const row = await prisma.asset.create({
    data: {
      tenantId,
      name: dto.name.trim(),
      serialNo: dto.serialNo?.trim() ?? null,
      category: dto.category?.trim() ?? null,
    },
  });
  return {
    id: row.id,
    name: row.name,
    serialNo: row.serialNo,
    category: row.category,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function assign(tenantId: string, assetId: string, dto: Assets.AssignAssetDto) {
  const asset = await prisma.asset.findFirst({ where: { id: assetId, tenantId } });
  if (!asset) throw new NotFoundError("Asset not found");
  const emp = await prisma.employee.findFirst({
    where: { id: dto.employeeId, tenantId, deletedAt: null },
  });
  if (!emp) throw new NotFoundError("Employee not found");

  await prisma.assetAssignment.updateMany({
    where: { assetId, returnedAt: null },
    data: { returnedAt: new Date() },
  });

  const row = await prisma.assetAssignment.create({
    data: { assetId, employeeId: dto.employeeId },
  });
  return {
    id: row.id,
    assetId: row.assetId,
    employeeId: row.employeeId,
    assignedAt: row.assignedAt.toISOString(),
  };
}

export async function returnAsset(tenantId: string, assetId: string) {
  const asset = await prisma.asset.findFirst({ where: { id: assetId, tenantId } });
  if (!asset) throw new NotFoundError("Asset not found");
  const active = await prisma.assetAssignment.findFirst({
    where: { assetId, returnedAt: null },
  });
  if (!active) throw new NotFoundError("No active assignment");
  await prisma.assetAssignment.update({
    where: { id: active.id },
    data: { returnedAt: new Date() },
  });
  return { returned: true };
}
