import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PERMISSION_CODES = [
  'employees:read',
  'employees:write',
  'payroll:read',
  'payroll:run',
  'payroll:approve',
  'leave:read',
  'leave:approve',
  'reports:read',
  'settings:read',
  'settings:write',
  'billing:read',
  'attendance:read',
  'attendance:write',
  'tasks:read',
  'tasks:write',
  'id-cards:read',
  'id-cards:write',
] as const;

async function main() {
  const permissions = [];
  for (const code of PERMISSION_CODES) {
    const row = await prisma.permission.upsert({
      where: { code },
      create: { code, description: code },
      update: {},
    });
    permissions.push(row);
  }

  const adminRoles = await prisma.role.findMany({ where: { name: 'ADMIN' } });
  for (const role of adminRoles) {
    for (const perm of permissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: { roleId: role.id, permissionId: perm.id },
        },
        create: { roleId: role.id, permissionId: perm.id },
        update: {},
      });
    }
  }

  // eslint-disable-next-line no-console
  console.log(
    `Seeded ${PERMISSION_CODES.length} permissions; synced ${adminRoles.length} ADMIN role(s).`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
