import { prisma } from "@sangam/db";
import { NotFoundError } from "@sangam/api-kit";
import type { Helpdesk } from "@sangam/contracts";

function mapTicket(row: {
  id: string;
  employeeId: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    employeeId: row.employeeId,
    subject: row.subject,
    status: row.status,
    priority: row.priority,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listForTenant(tenantId: string) {
  const rows = await prisma.supportTicket.findMany({
    where: { tenantId },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });
  return rows.map(mapTicket);
}

export async function listForEmployee(tenantId: string, employeeId: string) {
  const rows = await prisma.supportTicket.findMany({
    where: { tenantId, employeeId },
    orderBy: { updatedAt: "desc" },
  });
  return rows.map(mapTicket);
}

export async function create(
  tenantId: string,
  employeeId: string,
  dto: Helpdesk.CreateTicketDto,
) {
  const row = await prisma.supportTicket.create({
    data: {
      tenantId,
      employeeId,
      subject: dto.subject.trim(),
      priority: dto.priority ?? "MEDIUM",
    },
  });
  return mapTicket(row);
}

export async function updateStatus(
  tenantId: string,
  id: string,
  dto: Helpdesk.UpdateTicketStatusDto,
) {
  const row = await prisma.supportTicket.findFirst({ where: { id, tenantId } });
  if (!row) throw new NotFoundError("Ticket not found");
  const updated = await prisma.supportTicket.update({
    where: { id },
    data: { status: dto.status },
  });
  return mapTicket(updated);
}

export async function listComments(tenantId: string, ticketId: string) {
  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, tenantId },
  });
  if (!ticket) throw new NotFoundError("Ticket not found");
  const rows = await prisma.supportTicketComment.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    id: r.id,
    authorId: r.authorId,
    body: r.body,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function addComment(
  tenantId: string,
  ticketId: string,
  authorId: string,
  dto: Helpdesk.CreateTicketCommentDto,
) {
  const ticket = await prisma.supportTicket.findFirst({
    where: { id: ticketId, tenantId },
  });
  if (!ticket) throw new NotFoundError("Ticket not found");
  const row = await prisma.supportTicketComment.create({
    data: { ticketId, authorId, body: dto.body.trim() },
  });
  return {
    id: row.id,
    authorId: row.authorId,
    body: row.body,
    createdAt: row.createdAt.toISOString(),
  };
}
