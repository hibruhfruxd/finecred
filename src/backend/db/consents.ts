import { randomUUID } from "node:crypto";
import { getDb } from "./index";
import type { DatabaseAdapter } from "./adapter";
import type {
  ConsentRecord,
  ConsentStatus,
  Paginated,
  Pagination,
} from "@/models/production";

type Row = Record<string, unknown>;

function parseScope(value: unknown): string[] {
  if (typeof value !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is string => typeof entry === "string");
  } catch {
    return [];
  }
}

function effectiveStatus(status: string, expiresAt: string | null): ConsentStatus {
  if (status === "granted" && expiresAt && new Date(expiresAt).getTime() <= Date.now()) {
    return "expired";
  }
  if (status === "withdrawn" || status === "expired") return status;
  return "granted";
}

function toConsent(row: Row): ConsentRecord {
  const expiresAt = typeof row.expires_at === "string" ? row.expires_at : null;
  return {
    id: String(row.id ?? ""),
    userId: String(row.user_id ?? ""),
    userEmail: String(row.user_email ?? ""),
    userName: String(row.user_name ?? ""),
    lenderId: typeof row.lender_id === "string" ? row.lender_id : null,
    lenderEmail: typeof row.lender_email === "string" ? row.lender_email : null,
    lenderName: typeof row.lender_name === "string" ? row.lender_name : null,
    purpose: String(row.purpose ?? ""),
    description: String(row.description ?? ""),
    scope: parseScope(row.scope_json),
    status: effectiveStatus(String(row.status ?? ""), expiresAt),
    grantedAt: String(row.granted_at ?? ""),
    expiresAt,
    withdrawnAt: typeof row.withdrawn_at === "string" ? row.withdrawn_at : null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

const SELECT_CONSENT = `
  SELECT c.*, u.email AS user_email, u.full_name AS user_name,
         l.email AS lender_email, l.full_name AS lender_name
  FROM consents c
  JOIN users u ON u.id = c.user_id
  LEFT JOIN users l ON l.id = c.lender_id
`;

async function expireStaleConsents(db: DatabaseAdapter): Promise<void> {
  const now = new Date().toISOString();
  await db.execute(
    "UPDATE consents SET status = 'expired', updated_at = ? WHERE status = 'granted' AND expires_at IS NOT NULL AND expires_at < ?",
    [now, now],
  );
}

export async function createConsent(input: {
  userId: string;
  lenderId: string | null;
  purpose: string;
  description: string;
  scope: string[];
  expiresAt: string | null;
}): Promise<ConsentRecord> {
  const db = await getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO consents (
       id, user_id, lender_id, purpose, description, scope_json, status,
       granted_at, expires_at, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, 'granted', ?, ?, ?, ?)`,
    [
      id,
      input.userId,
      input.lenderId,
      input.purpose,
      input.description,
      JSON.stringify(input.scope),
      now,
      input.expiresAt,
      now,
      now,
    ],
  );
  const created = await findConsentById(id);
  if (!created) throw new Error("Consent insert succeeded but retrieval failed.");
  return created;
}

export async function findConsentById(id: string): Promise<ConsentRecord | null> {
  const db = await getDb();
  const row = await db.queryOne<Row>(`${SELECT_CONSENT} WHERE c.id = ?`, [id]);
  return row ? toConsent(row) : null;
}

export async function listConsentsForUser(userId: string): Promise<ConsentRecord[]> {
  const db = await getDb();
  await expireStaleConsents(db);
  const rows = await db.query<Row>(
    `${SELECT_CONSENT} WHERE c.user_id = ? ORDER BY c.created_at DESC`,
    [userId],
  );
  return rows.map(toConsent);
}

export async function listConsentsForLender(lenderId: string): Promise<ConsentRecord[]> {
  const db = await getDb();
  await expireStaleConsents(db);
  const rows = await db.query<Row>(
    `${SELECT_CONSENT} WHERE c.lender_id = ? ORDER BY c.created_at DESC`,
    [lenderId],
  );
  return rows.map(toConsent);
}

export async function listAllConsents(
  pagination: Pagination,
): Promise<Paginated<ConsentRecord>> {
  const db = await getDb();
  await expireStaleConsents(db);
  const rows = await db.query<Row>(
    `${SELECT_CONSENT} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
    [pagination.limit, pagination.offset],
  );
  const total = await db.queryOne<{ count: number | bigint | string }>(
    "SELECT COUNT(*) AS count FROM consents",
  );
  return {
    items: rows.map(toConsent),
    total: Number(total?.count ?? 0),
    limit: pagination.limit,
    offset: pagination.offset,
  };
}

export async function updateConsentStatus(input: {
  id: string;
  status: "granted" | "withdrawn";
  expiresAt?: string | null;
}): Promise<ConsentRecord | null> {
  const db = await getDb();
  const current = await findConsentById(input.id);
  if (!current) return null;

  const now = new Date().toISOString();
  const expiresAt =
    input.expiresAt === undefined ? current.expiresAt : input.expiresAt;
  await db.execute(
    `UPDATE consents
     SET status = ?, expires_at = ?, granted_at = ?, withdrawn_at = ?, updated_at = ?
     WHERE id = ?`,
    [
      input.status,
      expiresAt,
      input.status === "granted" ? now : current.grantedAt,
      input.status === "withdrawn" ? now : null,
      now,
      input.id,
    ],
  );
  return findConsentById(input.id);
}

export async function hasActiveConsent(
  userId: string,
  lenderId: string,
  scope?: string,
): Promise<boolean> {
  const consents = await listConsentsForLender(lenderId);
  return consents.some(
    (consent) =>
      consent.userId === userId &&
      consent.status === "granted" &&
      (scope === undefined || consent.scope.includes(scope)),
  );
}

export async function countConsents(status?: string): Promise<number> {
  const db = await getDb();
  const row = status
    ? await db.queryOne<{ count: number | bigint | string }>(
        "SELECT COUNT(*) AS count FROM consents WHERE status = ?",
        [status],
      )
    : await db.queryOne<{ count: number | bigint | string }>(
        "SELECT COUNT(*) AS count FROM consents",
      );
  return Number(row?.count ?? 0);
}
