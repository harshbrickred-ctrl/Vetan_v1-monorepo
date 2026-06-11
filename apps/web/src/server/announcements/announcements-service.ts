import { prisma } from "@sangam/db";
import { NotFoundError } from "@sangam/api-kit";
import type { Announcements } from "@sangam/contracts";

function mapRow(row: {
  id: string;
  title: string;
  body: string;
  pinned: boolean;
  authorId: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    pinned: row.pinned,
    authorId: row.authorId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listFeed(tenantId: string) {
  const rows = await prisma.announcement.findMany({
    where: { tenantId },
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    take: 100,
  });
  return rows.map(mapRow);
}

export async function create(
  tenantId: string,
  authorId: string | undefined,
  dto: Announcements.CreateAnnouncementDto,
) {
  const row = await prisma.announcement.create({
    data: {
      tenantId,
      title: dto.title.trim(),
      body: dto.body,
      pinned: dto.pinned ?? false,
      authorId: authorId ?? null,
    },
  });
  return mapRow(row);
}

export async function update(
  tenantId: string,
  id: string,
  dto: Announcements.UpdateAnnouncementDto,
) {
  const row = await prisma.announcement.findFirst({ where: { id, tenantId } });
  if (!row) throw new NotFoundError("Announcement not found");
  const updated = await prisma.announcement.update({
    where: { id },
    data: {
      ...(dto.title !== undefined && { title: dto.title.trim() }),
      ...(dto.body !== undefined && { body: dto.body }),
      ...(dto.pinned !== undefined && { pinned: dto.pinned }),
    },
  });
  return mapRow(updated);
}

export async function remove(tenantId: string, id: string) {
  const row = await prisma.announcement.findFirst({ where: { id, tenantId } });
  if (!row) throw new NotFoundError("Announcement not found");
  await prisma.announcement.delete({ where: { id } });
  return { deleted: true };
}
