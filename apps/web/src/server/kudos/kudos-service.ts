import { prisma } from "@sangam/db";
import { BadRequestError } from "@sangam/api-kit";
import type { Kudos } from "@sangam/contracts";

export async function listFeed(tenantId: string) {
  const rows = await prisma.recognition.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      from: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
      to: { select: { id: true, firstName: true, lastName: true, employeeCode: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    message: r.message,
    createdAt: r.createdAt.toISOString(),
    from: {
      id: r.from.id,
      name: `${r.from.firstName} ${r.from.lastName}`.trim(),
      employeeCode: r.from.employeeCode,
    },
    to: {
      id: r.to.id,
      name: `${r.to.firstName} ${r.to.lastName}`.trim(),
      employeeCode: r.to.employeeCode,
    },
  }));
}

export async function create(
  tenantId: string,
  fromId: string,
  dto: Kudos.CreateRecognitionDto,
) {
  if (fromId === dto.toId) {
    throw new BadRequestError("Cannot recognize yourself");
  }
  const to = await prisma.employee.findFirst({
    where: { id: dto.toId, tenantId, deletedAt: null },
  });
  if (!to) throw new BadRequestError("Recipient not found");

  const row = await prisma.recognition.create({
    data: { tenantId, fromId, toId: dto.toId, message: dto.message.trim() },
    include: {
      from: { select: { firstName: true, lastName: true, employeeCode: true } },
      to: { select: { firstName: true, lastName: true, employeeCode: true } },
    },
  });
  return {
    id: row.id,
    message: row.message,
    createdAt: row.createdAt.toISOString(),
    from: {
      name: `${row.from.firstName} ${row.from.lastName}`.trim(),
      employeeCode: row.from.employeeCode,
    },
    to: {
      name: `${row.to.firstName} ${row.to.lastName}`.trim(),
      employeeCode: row.to.employeeCode,
    },
  };
}
