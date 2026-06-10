import { withApi } from "@sangam/api-kit";
import { prisma } from "@sangam/db";
import { getLinkedEmployee } from "@/server/employee-portal/linked-employee";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = withApi(async (req) => {
  const emp = await getLinkedEmployee(req);
  const rows = await prisma.employee.findMany({
    where: { tenantId: emp.tenantId, deletedAt: null, status: "ACTIVE" },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
    },
    take: 300,
  });
  return rows.map((r) => ({
    id: r.id,
    employeeCode: r.employeeCode,
    firstName: r.firstName,
    lastName: r.lastName,
  }));
});
