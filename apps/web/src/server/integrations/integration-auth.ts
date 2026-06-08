import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import { prisma } from "@sangam/db";
import { UnauthorizedError } from "@sangam/api-kit";

export function hashIntegrationKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

function extractBearer(req: NextRequest): string | null {
  const h = req.headers.get("authorization");
  if (!h) return null;
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? m[1].trim() : null;
}

type IntegrationSettings = {
  integrations?: {
    idCardPortal?: {
      apiKeyHash?: string;
    };
  };
};

export async function requireIdCardIntegrationAuth(
  req: NextRequest,
): Promise<{ tenantId: string }> {
  const token = extractBearer(req);
  if (!token || !token.startsWith("vic_")) {
    throw new UnauthorizedError("Invalid integration API key");
  }
  const hash = hashIntegrationKey(token);
  const tenants = await prisma.tenant.findMany({
    select: { id: true, settings: true },
  });
  const match = tenants.find((t) => {
    const settings = (t.settings ?? {}) as IntegrationSettings;
    return settings.integrations?.idCardPortal?.apiKeyHash === hash;
  });
  if (!match) throw new UnauthorizedError("Invalid integration API key");
  return { tenantId: match.id };
}
