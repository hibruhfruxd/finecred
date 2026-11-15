import { createHash, randomBytes } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/models/auth";

export const SESSION_COOKIE = "fincred_session";
export const REFRESH_COOKIE = "fincred_refresh";
export const SESSION_MAX_AGE_SECONDS = 60 * 60;
export const REFRESH_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function getSecret(): Uint8Array {
  const secret =
    process.env.AUTH_SECRET ??
    "fincred-local-demo-secret-do-not-use-in-production-change-me";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    email: user.email,
    name: user.name,
    role: user.role,
    ver: user.authVersion,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(user.id)
    .setIssuer("fincred")
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: "fincred",
    });

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.role !== "string" ||
      typeof payload.ver !== "number"
    ) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      authVersion: payload.ver,
    };
  } catch {
    return null;
  }
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get("cookie");
  if (!header) return null;

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    const key = part.slice(0, separator).trim();
    if (key !== name) continue;
    const value = part.slice(separator + 1).trim();
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return null;
}

export function getSessionTokenFromRequest(request: Request): string | null {
  return readCookie(request, SESSION_COOKIE);
}

export function shouldUseSecureCookies(): boolean {
  return process.env.FINCRED_ENV === "production" || process.env.NODE_ENV === "production";
}

export function createOpaqueRefreshToken(): string {
  return randomBytes(48).toString("base64url");
}

export function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getRefreshTokenFromRequest(request: Request): string | null {
  return readCookie(request, REFRESH_COOKIE);
}
