import { prisma } from "@sangam/db";
import { ConflictError, NotFoundError } from "@sangam/api-kit";
import type { Training } from "@sangam/contracts";

export async function listCourses(tenantId: string) {
  const rows = await prisma.trainingCourse.findMany({
    where: { tenantId },
    orderBy: { title: "asc" },
    include: { _count: { select: { enrollments: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    enrollmentCount: r._count.enrollments,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function createCourse(tenantId: string, dto: Training.CreateCourseDto) {
  const row = await prisma.trainingCourse.create({
    data: {
      tenantId,
      title: dto.title.trim(),
      description: dto.description?.trim() ?? null,
    },
  });
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function enroll(
  tenantId: string,
  courseId: string,
  dto: Training.EnrollEmployeeDto,
) {
  const course = await prisma.trainingCourse.findFirst({
    where: { id: courseId, tenantId },
  });
  if (!course) throw new NotFoundError("Course not found");
  const emp = await prisma.employee.findFirst({
    where: { id: dto.employeeId, tenantId, deletedAt: null },
  });
  if (!emp) throw new NotFoundError("Employee not found");

  try {
    const row = await prisma.trainingEnrollment.create({
      data: { courseId, employeeId: dto.employeeId },
    });
    return {
      id: row.id,
      courseId: row.courseId,
      employeeId: row.employeeId,
      status: row.status,
    };
  } catch {
    throw new ConflictError("Employee already enrolled");
  }
}

export async function listMyEnrollments(employeeId: string) {
  const rows = await prisma.trainingEnrollment.findMany({
    where: { employeeId },
    include: { course: { select: { title: true, description: true } } },
    orderBy: { course: { title: "asc" } },
  });
  return rows.map((r) => ({
    id: r.id,
    courseId: r.courseId,
    courseTitle: r.course.title,
    status: r.status,
    completedAt: r.completedAt?.toISOString() ?? null,
  }));
}
