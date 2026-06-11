import { prisma } from "@sangam/db";
import { BadRequestError, NotFoundError } from "@sangam/api-kit";
import type { Users } from "@sangam/contracts";

function mapUser(row: {
  id: string;
  email: string;
  name: string;
  status: string;
  createdAt: Date;
  roles: Array<{ role: { id: string; name: string } }>;
  employee: { id: string; employeeCode: string } | null;
}) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    status: row.status,
    roles: row.roles.map((ur) => ({ id: ur.role.id, name: ur.role.name })),
    employee: row.employee
      ? { id: row.employee.id, employeeCode: row.employee.employeeCode }
      : null,
    createdAt: row.createdAt.toISOString(),
  };
}

const userInclude = {
  roles: { include: { role: { select: { id: true, name: true } } } },
  employee: { select: { id: true, employeeCode: true } },
} as const;

export async function list(tenantId: string) {
  const [users, roles] = await Promise.all([
    prisma.user.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { name: "asc" },
      include: userInclude,
    }),
    prisma.role.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        permissions: {
          include: { permission: { select: { code: true } } },
        },
      },
    }),
  ]);

  return {
    users: users.map(mapUser),
    roles: roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      permissions: r.permissions.map((rp) => rp.permission.code),
    })),
  };
}

export async function assignRoles(
  tenantId: string,
  userId: string,
  dto: Users.AssignUserRolesDto,
) {
  const user = await prisma.user.findFirst({
    where: { id: userId, tenantId, deletedAt: null },
  });
  if (!user) throw new NotFoundError("User not found");

  const roleIds = [...new Set(dto.roleIds)];
  if (roleIds.length) {
    const found = await prisma.role.count({
      where: { tenantId, id: { in: roleIds } },
    });
    if (found !== roleIds.length) {
      throw new BadRequestError("One or more roleIds are invalid");
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({ where: { userId } });
    if (roleIds.length) {
      await tx.userRole.createMany({
        data: roleIds.map((roleId) => ({ userId, roleId })),
      });
    }
  });

  const updated = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: userInclude,
  });
  return mapUser(updated);
}
