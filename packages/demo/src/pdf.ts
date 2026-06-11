import { put } from "@vercel/blob";
import PDFDocument from "pdfkit";
import { isDemoMode } from "./demo-mode";
import { isBlobConfigured, storage } from "./storage";

/**
 * PDF generation provider.
 *
 * In demo mode returns a canned URL pointing at `/samples/sample-payslip.pdf`
 * (or `/samples/sample-invoice.pdf` for invoices).
 *
 * When `DEMO_MODE=false`, payslips are rendered on the fly with `pdfkit` and
 * uploaded to Vercel Blob when configured (otherwise stored via the storage
 * mock index with bytes in `dataBase64`).
 *
 * Surface (kept intentionally narrow so callers don't change):
 *   - `generatePayslip(employeeCode, periodYear, periodMonth)` -> `{ url, fileName, mimeType }`
 *   - `generateInvoice(invoiceNumber)`                            -> `{ url, fileName, mimeType }`
 */

export type GeneratedDocument = {
  url: string;
  fileName: string;
  mimeType: string;
  storage: "sample" | "blob" | "s3";
};

const SHORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function samplePayslip(
  employeeCode: string,
  periodYear: number,
  periodMonth: number,
): GeneratedDocument {
  const month = SHORT_MONTHS[periodMonth - 1] ?? String(periodMonth);
  return {
    url: "/samples/sample-payslip.pdf",
    fileName: `payslip-${employeeCode}-${month}-${periodYear}.pdf`,
    mimeType: "application/pdf",
    storage: "sample",
  };
}

function sampleInvoice(invoiceNumber: string): GeneratedDocument {
  return {
    url: "/samples/sample-invoice.pdf",
    fileName: `invoice-${invoiceNumber}.pdf`,
    mimeType: "application/pdf",
    storage: "sample",
  };
}

function renderPayslipPdf(
  employeeCode: string,
  periodYear: number,
  periodMonth: number,
): Promise<Buffer> {
  const month = SHORT_MONTHS[periodMonth - 1] ?? String(periodMonth);
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).text("Payslip", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Employee code: ${employeeCode}`);
    doc.text(`Pay period: ${month} ${periodYear}`);
    doc.moveDown();
    doc.text("This is a simplified payslip generated for production mode.");
    doc.moveDown();
    doc.text("Earnings", { underline: true });
    doc.text("Basic salary: —");
    doc.text("Allowances: —");
    doc.moveDown();
    doc.text("Deductions", { underline: true });
    doc.text("PF / ESI / TDS: —");
    doc.moveDown();
    doc.fontSize(14).text("Net pay: —", { align: "right" });

    doc.end();
  });
}

export async function generatePayslip(
  employeeCode: string,
  periodYear: number,
  periodMonth: number,
): Promise<GeneratedDocument> {
  if (isDemoMode()) {
    return samplePayslip(employeeCode, periodYear, periodMonth);
  }

  const month = SHORT_MONTHS[periodMonth - 1] ?? String(periodMonth);
  const fileName = `payslip-${employeeCode}-${month}-${periodYear}.pdf`;
  const bytes = await renderPayslipPdf(employeeCode, periodYear, periodMonth);

  if (isBlobConfigured()) {
    const pathname = `payslips/${employeeCode}/${periodYear}-${String(periodMonth).padStart(2, "0")}-${Date.now()}.pdf`;
    const blob = await put(pathname, bytes, {
      access: "public",
      contentType: "application/pdf",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return {
      url: blob.url,
      fileName,
      mimeType: "application/pdf",
      storage: "blob",
    };
  }

  const uploaded = await storage.upload({
    bytes,
    fileName,
    mimeType: "application/pdf",
    sizeBytes: bytes.length,
    kind: "payslips",
    ownerRef: employeeCode,
  });

  return {
    url: uploaded.url,
    fileName: uploaded.fileName,
    mimeType: uploaded.mimeType,
    storage: uploaded.storage === "blob" ? "blob" : "sample",
  };
}

export function generateInvoice(invoiceNumber: string): GeneratedDocument {
  return sampleInvoice(invoiceNumber);
}
