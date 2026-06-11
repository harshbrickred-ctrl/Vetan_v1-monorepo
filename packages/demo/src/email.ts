import sgMail from "@sendgrid/mail";
import { randomUUID } from "crypto";
import { prisma } from "@sangam/db";
import { isDemoMode } from "./demo-mode";

/**
 * Email provider — pluggable. In demo mode, inserts into MockEmail so the
 * /platform/inbox UI surfaces every "sent" mail (OTPs, password resets, invites).
 *
 * When `DEMO_MODE=false` and `SENDGRID_API_KEY` is set, messages are sent via
 * SendGrid instead.
 */

export type EmailMessage = {
  to: string;
  from?: string;
  subject: string;
  body: string;
  /** Category tag used by the inbox UI (e.g. "verify-email", "reset-password"). */
  category?: string;
  metadata?: Record<string, unknown>;
  tenantId?: string;
};

export interface EmailProvider {
  send(msg: EmailMessage): Promise<{ id: string }>;
}

export function isSendGridConfigured(): boolean {
  if (isDemoMode()) return false;
  const key = process.env.SENDGRID_API_KEY;
  return Boolean(key && !key.includes("placeholder"));
}

const mockProvider: EmailProvider = {
  async send(msg) {
    const row = await prisma.mockEmail.create({
      data: {
        tenantId: msg.tenantId ?? null,
        toEmail: msg.to,
        fromEmail: msg.from ?? "no-reply@sangam.local",
        subject: msg.subject,
        body: msg.body,
        category: msg.category ?? null,
        metadata: (msg.metadata as object | undefined) ?? undefined,
      },
    });
    if (process.env.DEV_AUTH_VERBOSE === "true") {
      console.log(
        `[mock-email] -> ${msg.to} | ${msg.subject} (id=${row.id})`,
      );
    }
    return { id: row.id };
  },
};

const sendGridProvider: EmailProvider = {
  async send(msg) {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) {
      throw new Error("SENDGRID_API_KEY is not configured");
    }
    sgMail.setApiKey(apiKey);
    const from =
      msg.from ?? process.env.EMAIL_FROM ?? "no-reply@sangam.local";
    const [response] = await sgMail.send({
      to: msg.to,
      from,
      subject: msg.subject,
      text: msg.body,
    });
    const messageId =
      (response.headers["x-message-id"] as string | undefined) ?? randomUUID();
    return { id: messageId };
  },
};

export const email: EmailProvider =
  isDemoMode() || !isSendGridConfigured() ? mockProvider : sendGridProvider;
