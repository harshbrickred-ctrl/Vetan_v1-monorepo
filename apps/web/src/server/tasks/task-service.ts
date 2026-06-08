import { prisma, TaskPriority, TaskStatus } from "@sangam/db";
import { BadRequestError, NotFoundError } from "@sangam/api-kit";
import type { Tasks } from "@sangam/contracts";

export type ListTasksOptions = {
  status?: TaskStatus;
  assigneeId?: string;
  search?: string;
  limit?: number;
};

const assigneeSelect = {
  employeeCode: true,
  firstName: true,
  lastName: true,
  email: true,
} as const;

const assignedBySelect = {
  name: true,
  email: true,
} as const;

function mapTask(row: {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date | null;
  acceptedAt: Date | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assigneeId: string;
  assignedById: string;
  assignee: {
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedBy: { name: string; email: string };
}) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    priority: row.priority,
    dueDate: row.dueDate?.toISOString().slice(0, 10) ?? null,
    acceptedAt: row.acceptedAt?.toISOString() ?? null,
    startedAt: row.startedAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    assigneeId: row.assigneeId,
    assigneeName: `${row.assignee.firstName} ${row.assignee.lastName}`.trim(),
    assigneeCode: row.assignee.employeeCode,
    assigneeEmail: row.assignee.email,
    assignedById: row.assignedById,
    assignedByName: row.assignedBy.name,
    assignedByEmail: row.assignedBy.email,
  };
}

export async function listTasks(tenantId: string, opts?: ListTasksOptions) {
  const search = opts?.search?.trim();
  const rows = await prisma.task.findMany({
    where: {
      tenantId,
      ...(opts?.status && { status: opts.status }),
      ...(opts?.assigneeId && { assigneeId: opts.assigneeId }),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              {
                assignee: {
                  OR: [
                    { firstName: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
                    { employeeCode: { contains: search, mode: "insensitive" } },
                  ],
                },
              },
            ],
          }
        : {}),
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: Math.min(opts?.limit ?? 100, 200),
    include: {
      assignee: { select: assigneeSelect },
      assignedBy: { select: assignedBySelect },
    },
  });
  return rows.map(mapTask);
}

export async function getSummary(tenantId: string) {
  const groups = await prisma.task.groupBy({
    by: ["status"],
    where: { tenantId },
    _count: { _all: true },
  });
  const counts: Record<TaskStatus, number> = {
    PENDING: 0,
    ACCEPTED: 0,
    WORKING: 0,
    DONE: 0,
    CANCELLED: 0,
  };
  for (const g of groups) {
    counts[g.status] = g._count._all;
  }
  return {
    pending: counts.PENDING,
    accepted: counts.ACCEPTED,
    working: counts.WORKING,
    done: counts.DONE,
    cancelled: counts.CANCELLED,
    total:
      counts.PENDING +
      counts.ACCEPTED +
      counts.WORKING +
      counts.DONE +
      counts.CANCELLED,
  };
}

export async function createTask(
  tenantId: string,
  assignedById: string,
  dto: Tasks.CreateTaskDto,
) {
  const assignee = await prisma.employee.findFirst({
    where: {
      id: dto.assigneeId,
      tenantId,
      deletedAt: null,
      status: "ACTIVE",
    },
  });
  if (!assignee) {
    throw new BadRequestError("Assignee must be an active employee in this workspace");
  }

  const row = await prisma.task.create({
    data: {
      tenantId,
      assigneeId: dto.assigneeId,
      assignedById,
      title: dto.title.trim(),
      description: dto.description?.trim() || null,
      priority: dto.priority ?? TaskPriority.MEDIUM,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      status: TaskStatus.PENDING,
    },
    include: {
      assignee: { select: assigneeSelect },
      assignedBy: { select: assignedBySelect },
    },
  });
  return mapTask(row);
}

export async function updateAdminStatus(
  tenantId: string,
  taskId: string,
  status: "DONE" | "CANCELLED",
) {
  const row = await prisma.task.findFirst({
    where: { id: taskId, tenantId },
  });
  if (!row) throw new NotFoundError("Task not found");

  if (status === "CANCELLED") {
    if (row.status === TaskStatus.DONE || row.status === TaskStatus.CANCELLED) {
      throw new BadRequestError("Task cannot be cancelled in its current state");
    }
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.CANCELLED },
      include: {
        assignee: { select: assigneeSelect },
        assignedBy: { select: assignedBySelect },
      },
    });
    return mapTask(updated);
  }

  if (row.status === TaskStatus.CANCELLED) {
    throw new BadRequestError("Cancelled tasks cannot be marked done");
  }
  if (row.status === TaskStatus.DONE) {
    throw new BadRequestError("Task is already done");
  }

  const now = new Date();
  const updated = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: TaskStatus.DONE,
      completedAt: now,
      ...(row.acceptedAt ? {} : { acceptedAt: now }),
      ...(row.startedAt ? {} : { startedAt: now }),
    },
    include: {
      assignee: { select: assigneeSelect },
      assignedBy: { select: assignedBySelect },
    },
  });
  return mapTask(updated);
}

export async function listEmployeeTasks(employeeId: string, tenantId: string) {
  const rows = await prisma.task.findMany({
    where: {
      tenantId,
      assigneeId: employeeId,
      status: { not: TaskStatus.CANCELLED },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
    include: {
      assignee: { select: assigneeSelect },
      assignedBy: { select: assignedBySelect },
    },
  });
  return rows.map(mapTask);
}

export async function updateEmployeeStatus(
  tenantId: string,
  employeeId: string,
  taskId: string,
  status: "ACCEPTED" | "WORKING" | "DONE",
) {
  const row = await prisma.task.findFirst({
    where: { id: taskId, tenantId, assigneeId: employeeId },
  });
  if (!row) throw new NotFoundError("Task not found");
  if (row.status === TaskStatus.CANCELLED) {
    throw new BadRequestError("Task was cancelled");
  }
  if (row.status === TaskStatus.DONE) {
    throw new BadRequestError("Task is already done");
  }

  const now = new Date();
  if (status === "ACCEPTED") {
    if (row.status !== TaskStatus.PENDING) {
      throw new BadRequestError("Only pending tasks can be accepted");
    }
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.ACCEPTED, acceptedAt: now },
      include: {
        assignee: { select: assigneeSelect },
        assignedBy: { select: assignedBySelect },
      },
    });
    return mapTask(updated);
  }

  if (status === "WORKING") {
    if (row.status !== TaskStatus.ACCEPTED) {
      throw new BadRequestError("Accept the task before starting work");
    }
    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status: TaskStatus.WORKING, startedAt: now },
      include: {
        assignee: { select: assigneeSelect },
        assignedBy: { select: assignedBySelect },
      },
    });
    return mapTask(updated);
  }

  if (row.status !== TaskStatus.WORKING) {
    throw new BadRequestError("Start working on the task before marking it done");
  }
  const updated = await prisma.task.update({
    where: { id: taskId },
    data: { status: TaskStatus.DONE, completedAt: now },
    include: {
      assignee: { select: assigneeSelect },
      assignedBy: { select: assignedBySelect },
    },
  });
  return mapTask(updated);
}
