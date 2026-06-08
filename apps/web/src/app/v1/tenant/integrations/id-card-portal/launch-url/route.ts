import { requireAuth, withApi, NotFoundError } from "@sangam/api-kit";
import { prisma } from "@sangam/db";
import { SignJWT } from "jose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function portalUrl(): string {
  return (process.env.ID_CARD_PORTAL_URL ?? "http://localhost:3001").replace(/\/$/, "");
}

function apiBaseUrl(): string {
  return (process.env.FRONTEND_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export const GET = withApi(async (req) => {
  const user = await requireAuth(req, ["id-cards:read"]);
  const secret = process.env.ID_CARD_PORTAL_JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("ID_CARD_PORTAL_JWT_SECRET is not configured");
  }

  const tenant = await prisma.tenant.findUnique({ where: { id: user.tenantId } });
  if (!tenant) throw new NotFoundError("Tenant not found");

  const token = await new SignJWT({
    source: "vetan",
    externalOrgId: tenant.id,
    userId: user.sub,
    email: user.email,
    name: user.email,
    permissions: (user.permissions ?? []).filter((p) => p.startsWith("id-cards:")),
    orgName: tenant.name,
    apiBaseUrl: apiBaseUrl(),
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(new TextEncoder().encode(secret));

  const url = `${portalUrl()}/auth/connect?source=vetan&token=${encodeURIComponent(token)}`;
  return { url };
});
