import { put, del } from "@vercel/blob";
import { prisma } from "@sangam/db";
import { isDemoMode } from "./demo-mode";

/**
 * Storage provider — pluggable. In demo mode, file BYTES are discarded; only
 * the metadata + a synthetic URL are persisted (in `MockUpload`). Downloads
 * resolve to a sample PDF served from `apps/web/public/samples/`.
 *
 * When `DEMO_MODE=false` and `BLOB_READ_WRITE_TOKEN` is set, uploads go to
 * Vercel Blob and downloads return the blob URL.
 *
 * Why throw away the bytes in demo? Vercel serverless functions have a read-only
 * filesystem outside /tmp, and /tmp is per-invocation. So we cannot persist
 * uploaded bytes locally. Real persistence requires S3/Blob anyway, and
 * giving the demo a "good enough" download path keeps the workflow demoable.
 */

export type UploadInput = {
  /** The bytes of the uploaded file. Discarded in demo mode. */
  bytes: Buffer | Uint8Array;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  tenantId?: string;
  /** Bucket / logical folder: "tenant-legal-docs", "employee-docs", etc. */
  kind: string;
  /** Owner reference: employeeId, slug, etc. */
  ownerRef?: string;
  uploadedBy?: string;
};

export type UploadResult = {
  id: string;
  url: string;
  storage: "mock" | "s3" | "blob";
  fileName: string;
  mimeType: string;
  sizeBytes: number;
};

export type StorageDownloadResult = {
  url: string;
  mimeType: string;
  fileName: string;
  dataBase64?: string | null;
};

export interface StorageProvider {
  upload(input: UploadInput): Promise<UploadResult>;
  download(id: string): Promise<StorageDownloadResult>;
  remove(id: string): Promise<void>;
}

export function isBlobConfigured(): boolean {
  if (isDemoMode()) return false;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  return Boolean(token && !token.includes("placeholder"));
}

/** Sample-file routing: which canned PDF/image to serve for each kind. */
function sampleUrlFor(kind: string, mimeType: string): string {
  if (mimeType.startsWith("image/")) return "/samples/sample-image.png";
  switch (kind) {
    case "tenant-legal-docs":
      return "/samples/sample-legal-document.pdf";
    case "employee-docs":
      return "/samples/sample-employee-document.pdf";
    case "visitor-photos":
      return "/samples/sample-image.png";
    case "payslips":
      return "/samples/sample-payslip.pdf";
    case "invoices":
      return "/samples/sample-invoice.pdf";
    default:
      return "/samples/sample-document.pdf";
  }
}

function blobPathname(input: UploadInput): string {
  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 180);
  const scope = input.tenantId ?? "global";
  return `${input.kind}/${scope}/${Date.now()}-${safeName}`;
}

const mockProvider: StorageProvider = {
  async upload(input) {
    const url = sampleUrlFor(input.kind, input.mimeType);
    const dataBase64 = Buffer.from(input.bytes).toString("base64");
    const row = await prisma.mockUpload.create({
      data: {
        tenantId: input.tenantId ?? null,
        kind: input.kind,
        ownerRef: input.ownerRef ?? null,
        fileName: input.fileName.slice(0, 255),
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        storage: "mock",
        url,
        dataBase64,
        uploadedBy: input.uploadedBy ?? null,
      },
    });
    return {
      id: row.id,
      url: row.url,
      storage: "mock",
      fileName: row.fileName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
    };
  },

  async download(id) {
    const row = await prisma.mockUpload.findUnique({ where: { id } });
    if (!row) throw new Error("Upload not found");
    return {
      url: row.url,
      mimeType: row.mimeType,
      fileName: row.fileName,
      dataBase64: row.dataBase64,
    };
  },

  async remove(id) {
    await prisma.mockUpload.delete({ where: { id } }).catch(() => undefined);
  },
};

const blobProvider: StorageProvider = {
  async upload(input) {
    const body = Buffer.from(input.bytes);
    const blob = await put(blobPathname(input), body, {
      access: "public",
      contentType: input.mimeType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    const row = await prisma.mockUpload.create({
      data: {
        tenantId: input.tenantId ?? null,
        kind: input.kind,
        ownerRef: input.ownerRef ?? null,
        fileName: input.fileName.slice(0, 255),
        mimeType: input.mimeType,
        sizeBytes: input.sizeBytes,
        storage: "blob",
        url: blob.url,
        uploadedBy: input.uploadedBy ?? null,
      },
    });
    return {
      id: row.id,
      url: row.url,
      storage: "blob",
      fileName: row.fileName,
      mimeType: row.mimeType,
      sizeBytes: row.sizeBytes,
    };
  },

  async download(id) {
    const row = await prisma.mockUpload.findUnique({ where: { id } });
    if (!row) throw new Error("Upload not found");
    return {
      url: row.url,
      mimeType: row.mimeType,
      fileName: row.fileName,
      dataBase64: null,
    };
  },

  async remove(id) {
    const row = await prisma.mockUpload.findUnique({ where: { id } });
    if (row?.storage === "blob" && row.url) {
      await del(row.url, { token: process.env.BLOB_READ_WRITE_TOKEN }).catch(
        () => undefined,
      );
    }
    await prisma.mockUpload.delete({ where: { id } }).catch(() => undefined);
  },
};

export const storage: StorageProvider =
  isDemoMode() || !isBlobConfigured() ? mockProvider : blobProvider;
