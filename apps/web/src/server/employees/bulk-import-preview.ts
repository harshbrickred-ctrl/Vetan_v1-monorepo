import { prisma } from "@sangam/db";
import type { Employees } from "@sangam/contracts";

async function resolveDepartmentIdByCode(tenantId: string, code: string) {
  const row = await prisma.department.findFirst({
    where: { tenantId, code: code.toUpperCase(), deletedAt: null },
    select: { id: true },
  });
  return row?.id ?? null;
}

async function resolveDesignationIdByTitle(tenantId: string, title: string) {
  const row = await prisma.designation.findFirst({
    where: { tenantId, title: { equals: title, mode: "insensitive" }, deletedAt: null },
    select: { id: true },
  });
  return row?.id ?? null;
}

export async function previewBulkImport(
  tenantId: string,
  rows: Employees.BulkEmployeeImportRowDto[],
) {
  const valid: Array<{ index: number; email: string; employeeCode: string | null }> = [];
  const errors: Array<{ index: number; message: string }> = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const issues: string[] = [];
    const email = row.email.trim().toLowerCase();

    const dupEmail = await prisma.employee.findFirst({
      where: { tenantId, email, deletedAt: null },
    });
    if (dupEmail) issues.push("Email already exists");

    const code = row.employeeCode?.trim().toUpperCase();
    if (code) {
      const dupCode = await prisma.employee.findFirst({
        where: { tenantId, employeeCode: code, deletedAt: null },
      });
      if (dupCode) issues.push("Employee code already in use");
    }

    const deptCode = row.departmentCode?.trim();
    if (deptCode && !(await resolveDepartmentIdByCode(tenantId, deptCode))) {
      issues.push(`Unknown department code: ${deptCode}`);
    }

    const desTitle = row.designationTitle?.trim();
    if (desTitle && !(await resolveDesignationIdByTitle(tenantId, desTitle))) {
      issues.push(`Unknown designation title: ${desTitle}`);
    }

    if (issues.length) {
      errors.push({ index: i, message: issues.join("; ") });
    } else {
      valid.push({ index: i, email, employeeCode: code ?? null });
    }
  }

  return {
    totalRows: rows.length,
    validCount: valid.length,
    errorCount: errors.length,
    valid,
    errors,
    dryRun: true,
  };
}
