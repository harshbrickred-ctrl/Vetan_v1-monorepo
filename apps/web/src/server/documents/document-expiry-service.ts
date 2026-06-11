import { prisma } from "@sangam/db";

export async function listExpiringSoon(tenantId: string, withinDays = 30) {
  const now = new Date();
  const until = new Date(now);
  until.setDate(until.getDate() + withinDays);

  const rows = await prisma.employeeOnboardingDocument.findMany({
    where: {
      tenantId,
      expiresAt: { gte: now, lte: until },
    },
    orderBy: { expiresAt: "asc" },
    take: 200,
    include: {
      employee: {
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return rows.map((r) => ({
    id: r.id,
    documentType: r.documentType,
    originalFilename: r.originalFilename,
    expiresAt: r.expiresAt!.toISOString(),
    employee: {
      id: r.employee.id,
      employeeCode: r.employee.employeeCode,
      name: `${r.employee.firstName} ${r.employee.lastName}`.trim(),
      email: r.employee.email,
    },
  }));
}

export async function runExpiryScan(tenantId?: string) {
  const tenants = tenantId
    ? [{ id: tenantId }]
    : await prisma.tenant.findMany({ select: { id: true } });

  const results = [];
  for (const t of tenants) {
    const expiring = await listExpiringSoon(t.id, 30);
    results.push({ tenantId: t.id, count: expiring.length });
  }
  return { scannedTenants: results.length, results };
}
