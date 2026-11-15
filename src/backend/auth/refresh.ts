import { createHash, randomUUID } from "node:crypto";
import { ApiError } from "@/backend/http/errors";
import { getDb } from "@/backend/db";
import {
  findRefreshTokenByHash,
  refreshExpiry,
  revokeRefreshFamily,
  revokeRefreshToken,
  storeRefreshToken,
} from "@/backend/db/refresh-tokens";
import { createOpaqueRefreshToken, hashRefreshToken } from "./token";

export interface AuthRequestContext {
  userAgent: string | null;
  ipHash: string | null;
}

export interface IssuedRefreshToken {
  rawToken: string;
  familyId: string;
  expiresAt: string;
}

export function getAuthRequestContext(request: Request): AuthRequestContext {
  const userAgent = request.headers.get("user-agent");
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
  return {
    userAgent: userAgent ? userAgent.slice(0, 500) : null,
    ipHash: ip ? createHash("sha256").update(ip).digest("hex") : null,
  };
}

export async function issueRefreshToken(
  userId: string,
  context: AuthRequestContext,
  familyId = randomUUID(),
): Promise<IssuedRefreshToken> {
  const rawToken = createOpaqueRefreshToken();
  const expiresAt = refreshExpiry();
  await storeRefreshToken({
    userId,
    rawToken,
    familyId,
    expiresAt,
    userAgent: context.userAgent,
    ipHash: context.ipHash,
  });
  return { rawToken, familyId, expiresAt };
}

export async function rotateRefreshToken(
  rawToken: string,
  context: AuthRequestContext,
): Promise<{ userId: string; refreshToken: IssuedRefreshToken }> {
  const db = await getDb();
  const tokenHash = hashRefreshToken(rawToken);
  const now = new Date();

  const outcome = await db.transaction(async (tx) => {
    const current = await findRefreshTokenByHash(tokenHash, tx, true);
    if (!current) return { kind: "invalid" as const };

    if (current.revokedAt) {
      if (current.replacedBy) {
        await revokeRefreshFamily(current.familyId, tx);
        return { kind: "reuse" as const };
      }
      return { kind: "invalid" as const };
    }

    if (new Date(current.expiresAt).getTime() <= now.getTime()) {
      await revokeRefreshToken(current.id, null, tx);
      return { kind: "expired" as const };
    }

    const user = await tx.queryOne<{ id: string }>("SELECT id FROM users WHERE id = ?", [
      current.userId,
    ]);
    if (!user) {
      await revokeRefreshToken(current.id, null, tx);
      return { kind: "invalid" as const };
    }

    const nextRawToken = createOpaqueRefreshToken();
    const nextExpiresAt = refreshExpiry(now);
    const next = await storeRefreshToken(
      {
        userId: current.userId,
        rawToken: nextRawToken,
        familyId: current.familyId,
        expiresAt: nextExpiresAt,
        userAgent: context.userAgent,
        ipHash: context.ipHash,
      },
      tx,
    );
    await revokeRefreshToken(current.id, next.id, tx);

    return {
      kind: "rotated" as const,
      userId: current.userId,
      refreshToken: {
        rawToken: nextRawToken,
        familyId: current.familyId,
        expiresAt: nextExpiresAt,
      },
    };
  });

  if (outcome.kind === "rotated") {
    return { userId: outcome.userId, refreshToken: outcome.refreshToken };
  }
  if (outcome.kind === "reuse") {
    throw new ApiError(
      401,
      "refresh_token_reused",
      "This session has been revoked because the refresh token was reused. Please sign in again.",
    );
  }
  throw new ApiError(
    401,
    "invalid_refresh_token",
    "Your session has expired. Please sign in again.",
  );
}
