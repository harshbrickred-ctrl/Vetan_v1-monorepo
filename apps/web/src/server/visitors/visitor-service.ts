import { prisma } from "@sangam/db";
import { BadRequestError, NotFoundError } from "@sangam/api-kit";
import { storage } from "@sangam/demo";
import type { Visitors } from "@sangam/contracts";

const ALLOWED_PHOTO_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_PHOTO_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;

export type VisitorRow = {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  visitToName: string;
  visitToEmployeeId: string | null;
  visitedAt: string;
  hasPhoto: boolean;
  photoMimeType: string | null;
  registeredByEmployeeId: string;
  registeredByName: string;
  registeredByCode: string;
  createdAt: string;
};

export type ListVisitorsOptions = {
  search?: string;
  visitToEmployeeId?: string;
  from?: string;
  to?: string;
  limit?: number;
};

export type UploadPhotoInput = {
  fileName: string;
  mimeType: string;
  bytes: Buffer;
  sizeBytes: number;
};

const employeeBriefSelect = {
  employeeCode: true,
  firstName: true,
  lastName: true,
} as const;

function mapVisitor(row: {
  id: string;
  name: string;
  phone: string;
  purpose: string;
  visitToName: string;
  visitToEmployeeId: string | null;
  visitedAt: Date;
  photoStoredFilename: string | null;
  photoMimeType: string | null;
  registeredByEmployeeId: string;
  createdAt: Date;
  registeredBy: {
    employeeCode: string;
    firstName: string;
    lastName: string;
  };
}): VisitorRow {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    purpose: row.purpose,
    visitToName: row.visitToName,
    visitToEmployeeId: row.visitToEmployeeId,
    visitedAt: row.visitedAt.toISOString(),
    hasPhoto: !!row.photoStoredFilename,
    photoMimeType: row.photoMimeType,
    registeredByEmployeeId: row.registeredByEmployeeId,
    registeredByName: `${row.registeredBy.firstName} ${row.registeredBy.lastName}`.trim(),
    registeredByCode: row.registeredBy.employeeCode,
    createdAt: row.createdAt.toISOString(),
  };
}

function extOf(name: string): string {
  const i = name.lastIndexOf(".");
  if (i < 0) return "";
  return name.slice(i).toLowerCase();
}

function normalizePhoto(photo: UploadPhotoInput): UploadPhotoInput {
  let mimeType = photo.mimeType.trim().toLowerCase();
  if (!mimeType || mimeType === "image/jpg") mimeType = "image/jpeg";

  let fileName = photo.fileName.trim();
  if (!fileName || !extOf(fileName)) {
    const ext =
      mimeType === "image/png"
        ? ".png"
        : mimeType === "image/webp"
          ? ".webp"
          : ".jpg";
    fileName = `visitor-photo${ext}`;
  }

  return { ...photo, mimeType, fileName };
}

async function assertHostEmployee(tenantId: string, employeeId: string) {
  const emp = await prisma.employee.findFirst({
    where: { id: employeeId, tenantId, deletedAt: null, status: "ACTIVE" },
    select: { id: true, firstName: true, lastName: true },
  });
  if (!emp) {
    throw new BadRequestError("Selected host must be an active employee");
  }
  return emp;
}

function parseVisitedAt(raw: string): Date {
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestError("Invalid visit date and time");
  }
  return d;
}

export async function listVisitors(tenantId: string, opts?: ListVisitorsOptions) {
  const search = opts?.search?.trim();
  const rows = await prisma.visitorRecord.findMany({
    where: {
      tenantId,
      ...(opts?.visitToEmployeeId && { visitToEmployeeId: opts.visitToEmployeeId }),
      ...(opts?.from || opts?.to
        ? {
            visitedAt: {
              ...(opts.from ? { gte: new Date(`${opts.from}T00:00:00.000Z`) } : {}),
              ...(opts.to ? { lte: new Date(`${opts.to}T23:59:59.999Z`) } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { purpose: { contains: search, mode: "insensitive" } },
              { visitToName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { visitedAt: "desc" },
    take: Math.min(opts?.limit ?? 100, 200),
    include: { registeredBy: { select: employeeBriefSelect } },
  });
  return rows.map(mapVisitor);
}

export async function createVisitor(
  tenantId: string,
  registeredByEmployeeId: string,
  fields: Visitors.CreateVisitorFieldsDto,
  photo?: UploadPhotoInput,
) {
  let visitToName = fields.visitToName.trim();
  let visitToEmployeeId: string | null = fields.visitToEmployeeId ?? null;

  if (visitToEmployeeId) {
    const host = await assertHostEmployee(tenantId, visitToEmployeeId);
    visitToName = `${host.firstName} ${host.lastName}`.trim();
  }

  if (!visitToName) {
    throw new BadRequestError("Whom to visit is required");
  }

  if (!photo || !photo.bytes.length) {
    throw new BadRequestError("Visitor photo is required");
  }

  const normalized = normalizePhoto(photo);
  if (normalized.sizeBytes > MAX_PHOTO_BYTES) {
    throw new BadRequestError("Photo too large (max 8 MB)");
  }
  if (!ALLOWED_PHOTO_MIMES.has(normalized.mimeType)) {
    throw new BadRequestError("Photo must be JPEG, PNG, or WebP");
  }
  const ext = extOf(normalized.fileName);
  if (!ALLOWED_PHOTO_EXT.has(ext)) {
    throw new BadRequestError("Invalid photo extension");
  }

  const safeOriginal =
    normalized.fileName.replace(/[^\w.\-()+ ]/g, "_") || "visitor-photo.jpg";
  const uploaded = await storage.upload({
    bytes: normalized.bytes,
    fileName: safeOriginal,
    mimeType: normalized.mimeType,
    sizeBytes: normalized.sizeBytes,
    tenantId,
    kind: "visitor-photos",
    ownerRef: registeredByEmployeeId,
  });

  try {
    const row = await prisma.visitorRecord.create({
      data: {
        tenantId,
        name: fields.name.trim(),
        phone: fields.phone.trim(),
        purpose: fields.purpose.trim(),
        visitToName,
        visitToEmployeeId,
        visitedAt: parseVisitedAt(fields.visitedAt),
        photoStoredFilename: uploaded.id,
        photoMimeType: normalized.mimeType,
        photoSizeBytes: normalized.sizeBytes,
        photoOriginalFilename: safeOriginal.slice(0, 255),
        registeredByEmployeeId,
      },
      include: { registeredBy: { select: employeeBriefSelect } },
    });
    return mapVisitor(row);
  } catch (e) {
    await storage.remove(uploaded.id).catch(() => undefined);
    throw e;
  }
}

export type PhotoDownloadResolution = {
  mimeType: string;
  fileName: string;
  bytes?: Buffer;
  redirectUrl?: string;
};

export async function resolvePhotoDownload(
  tenantId: string,
  visitorId: string,
): Promise<PhotoDownloadResolution> {
  const row = await prisma.visitorRecord.findFirst({
    where: { id: visitorId, tenantId },
  });
  if (!row || !row.photoStoredFilename) {
    throw new NotFoundError("Visitor photo not found");
  }
  const meta = await storage.download(row.photoStoredFilename);
  const mimeType = row.photoMimeType ?? meta.mimeType;
  const fileName = row.photoOriginalFilename ?? meta.fileName;

  if (meta.dataBase64) {
    return {
      mimeType,
      fileName,
      bytes: Buffer.from(meta.dataBase64, "base64"),
    };
  }

  return {
    mimeType,
    fileName,
    redirectUrl: meta.url,
  };
}
