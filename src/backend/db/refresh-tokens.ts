import { randomUUID } from "node:crypto";
import { getDb } from "./index";
import type { DatabaseAdapter } from "./adapter";
import { hashRefreshToken } from "@/backend/auth/token";
import { REFRESH_MAX_AGE_SECONDS } from "@/backend/auth/token";

export interface RefreshTokenRecord {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: string;
  createdAt: string;
  revokedAt: string | null;
  replacedBy: string | null;
}

type Row = Record<string, unknown>;

function toRecord(row: Row): RefreshTokenRecord {
  return {
    id: String(row.id ?? ""),
    userId: String(row.user_id ?? ""),
    tokenHash: String(row.token_hash ?? ""),
    familyId: String(row.family_id ?? ""),
    expiresAt: String(row.expires_at ?? ""),
    createdAt: String(row.created_at ?? ""),
    revokedAt: typeof row.revoked_at === "string" ? row.revoked_at : null,
    replacedBy: typeof row.replaced_by === "string" ? row.replaced_by : null,
  };
}

export function refreshExpiry(now = new Date()): string {
  return new Date(now.getTime() + REFRESH_MAX_AGE_SECONDS * 1000).toISOString();
}

export async function storeRefreshToken(
  input: {
    userId: string;
    rawToken: string;
    familyId: string;
    expiresAt: string;
    userAgent: string | null;
    ipHash: string | null;
  },
  tx?: DatabaseAdapter,
): Promise<RefreshTokenRecord> {
  const db = tx ?? (await getDb());
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  await db.execute(
    `INSERT INTO refresh_tokens (
       id, user_id, token_hash, family_id, expires_at, created_at, user_agent, ip_hash
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.userId,
      hashRefreshToken(input.rawToken),
      input.familyId,
      input.expiresAt,
      createdAt,
      input.userAgent,
      input.ipHash,
    ],
  );

  return {
    id,
    userId: input.userId,
    tokenHash: hashRefreshToken(input.rawToken),
    familyId: input.familyId,
    expiresAt: input.expiresAt,
    createdAt,
    revokedAt: null,
    replacedBy: null,
  };
}

export async function findRefreshTokenByHash(
  tokenHash: string,
  tx?: DatabaseAdapter,
  forUpdate = false,
): Promise<RefreshTokenRecord | null> {
  const db = tx ?? (await getDb());
  const lock = forUpdate && db.dialect === "postgres" ? " FOR UPDATE" : "";
  const row = await db.queryOne<Row>(
    `SELECT * FROM refresh_tokens WHERE token_hash = ?${lock}`,
    [tokenHash],
  );
  return row ? toRecord(row) : null;
}

export async function revokeRefreshToken(
  tokenId: string,
  replacedBy: string | null = null,
  tx?: DatabaseAdapter,
): Promise<void> {
  const db = tx ?? (await getDb());
  await db.execute(
    "UPDATE refresh_tokens SET revoked_at = ?, replaced_by = ? WHERE id = ? AND revoked_at IS NULL",
    [new Date().toISOString(), replacedBy, tokenId],
  );
}

export async function revokeRefreshFamily(
  familyId: string,
  tx?: DatabaseAdapter,
): Promise<void> {
  const db = tx ?? (await getDb());
  await db.execute(
    "UPDATE refresh_tokens SET revoked_at = ? WHERE family_id = ? AND revoked_at IS NULL",
    [new Date().toISOString(), familyId],
  );
}

export async function revokeRefreshTokenByRaw(rawToken: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE refresh_tokens SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL",
    [new Date().toISOString(), hashRefreshToken(rawToken)],
  );
}

export async function revokeAllRefreshTokensForUser(userId: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE refresh_tokens SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL",
    [new Date().toISOString(), userId],
  );
}

export async function pruneExpiredRefreshTokens(now = new Date()): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM refresh_tokens WHERE expires_at < ?", [now.toISOString()]);
}
