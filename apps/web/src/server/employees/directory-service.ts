import { prisma } from "@sangam/db";

export async function listDirectory(tenantId: string, search?: string) {
  const q = search?.trim();
  const rows = await prisma.employee.findMany({
    where: {
      tenantId,
      deletedAt: null,
      status: "ACTIVE",
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { employeeCode: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      email: true,
      department: { select: { name: true } },
      designation: { select: { title: true } },
      manager: { select: { firstName: true, lastName: true } },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    take: 500,
  });

  return rows.map((r) => ({
    id: r.id,
    employeeCode: r.employeeCode,
    name: `${r.firstName} ${r.lastName}`.trim(),
    email: r.email,
    department: r.department?.name ?? null,
    designation: r.designation?.title ?? null,
    managerName: r.manager
      ? `${r.manager.firstName} ${r.manager.lastName}`.trim()
      : null,
  }));
}
