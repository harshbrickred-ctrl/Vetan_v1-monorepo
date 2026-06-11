import { prisma } from "@sangam/db";

export type OrgChartNode = {
  id: string;
  employeeCode: string;
  name: string;
  designation: string | null;
  department: string | null;
  managerId: string | null;
  children: OrgChartNode[];
};

export async function getOrgChart(tenantId: string): Promise<OrgChartNode[]> {
  const rows = await prisma.employee.findMany({
    where: { tenantId, deletedAt: null, status: "ACTIVE" },
    select: {
      id: true,
      employeeCode: true,
      firstName: true,
      lastName: true,
      managerId: true,
      designation: { select: { title: true } },
      department: { select: { name: true } },
    },
    orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
  });

  const nodeMap = new Map<string, OrgChartNode>();
  for (const r of rows) {
    nodeMap.set(r.id, {
      id: r.id,
      employeeCode: r.employeeCode,
      name: `${r.firstName} ${r.lastName}`.trim(),
      designation: r.designation?.title ?? null,
      department: r.department?.name ?? null,
      managerId: r.managerId,
      children: [],
    });
  }

  const roots: OrgChartNode[] = [];
  for (const node of nodeMap.values()) {
    if (node.managerId && nodeMap.has(node.managerId)) {
      nodeMap.get(node.managerId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
