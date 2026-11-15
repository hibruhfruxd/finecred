import { randomUUID } from "node:crypto";
import type { PaymentCategory } from "@/models/domain";
import { getDb } from "./index";
import type { DatabaseAdapter } from "./adapter";
import { isUniqueViolation } from "./adapter";
import type {
  InsertTransactionInput,
  TransactionRecord,
  TransactionSummary,
  UserRecord,
  UserRow,
} from "@/models/db";

type Row = Record<string, unknown>;

function asString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value);
  return 0;
}

function parseMetadata(value: unknown): Record<string, string> {
  if (typeof value !== "string" || value.length === 0) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const metadata: Record<string, string> = {};
    for (const [key, entry] of Object.entries(parsed)) {
      if (typeof entry === "string") metadata[key] = entry;
    }
    return metadata;
  } catch {
    return {};
  }
}

function toUser(row: Row): UserRow {
  return {
    id: asString(row.id),
    email: asString(row.email),
    fullName: asString(row.full_name),
    passwordHash: asString(row.password_hash),
    role: asString(row.role),
    status: asString(row.status) || "active",
    authVersion: asNumber(row.auth_version),
    createdAt: asString(row.created_at),
  };
}

export function toPublicUser(user: UserRow): UserRecord {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    authVersion: user.authVersion,
    createdAt: user.createdAt,
  };
}

function toTransaction(row: Row): TransactionRecord {
  const storedName = asNullableString(row.attachment_stored_name);
  return {
    id: asString(row.id),
    userId: asString(row.user_id),
    category: asString(row.category) as PaymentCategory,
    amountCents: asNumber(row.amount_cents),
    transactionDate: asString(row.transaction_date),
    platform: asString(row.platform),
    description: asString(row.description),
    metadata: parseMetadata(row.metadata_json),
    attachment: storedName
      ? {
          filename: asString(row.attachment_filename),
          storedName,
          mimeType: asString(row.attachment_mime),
          size: asNumber(row.attachment_size),
        }
      : null,
    createdAt: asString(row.created_at),
  };
}

export async function findUserByEmail(email: string): Promise<UserRow | null> {
  const db = await getDb();
  const row = await db.queryOne<Row>("SELECT * FROM users WHERE email = ?", [
    email.toLowerCase(),
  ]);
  return row ? toUser(row) : null;
}

export async function findUserById(id: string): Promise<UserRow | null> {
  const db = await getDb();
  const row = await db.queryOne<Row>("SELECT * FROM users WHERE id = ?", [id]);
  return row ? toUser(row) : null;
}

export async function createUser(input: {
  email: string;
  fullName: string;
  passwordHash: string;
  role: string;
}): Promise<UserRow> {
  const db = await getDb();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  await db.execute(
    `INSERT INTO users (id, email, full_name, password_hash, role, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, input.email.toLowerCase(), input.fullName, input.passwordHash, input.role, createdAt],
  );
  const user = await findUserById(id);
  if (!user) throw new Error("User insert succeeded but retrieval failed.");
  return user;
}

export async function updateUserPasswordHash(userId: string, passwordHash: string): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE users SET password_hash = ? WHERE id = ?", [passwordHash, userId]);
}

export async function findTransactionById(
  userId: string,
  id: string,
): Promise<TransactionRecord | null> {
  const db = await getDb();
  const row = await db.queryOne<Row>(
    "SELECT * FROM transactions WHERE id = ? AND user_id = ?",
    [id, userId],
  );
  return row ? toTransaction(row) : null;
}

export async function findTransactionByFingerprint(
  userId: string,
  fingerprint: string,
): Promise<TransactionRecord | null> {
  const db = await getDb();
  const row = await db.queryOne<Row>(
    "SELECT * FROM transactions WHERE user_id = ? AND fingerprint = ?",
    [userId, fingerprint],
  );
  return row ? toTransaction(row) : null;
}

export async function listTransactions(
  userId: string,
  options: { category?: PaymentCategory; limit?: number } = {},
): Promise<TransactionRecord[]> {
  const db = await getDb();
  const limit = Math.min(Math.max(options.limit ?? 100, 1), 200);
  const rows = options.category
    ? await db.query<Row>(
        `SELECT * FROM transactions
         WHERE user_id = ? AND category = ?
         ORDER BY transaction_date DESC, created_at DESC
         LIMIT ?`,
        [userId, options.category, limit],
      )
    : await db.query<Row>(
        `SELECT * FROM transactions
         WHERE user_id = ?
         ORDER BY transaction_date DESC, created_at DESC
         LIMIT ?`,
        [userId, limit],
      );

  return rows.map(toTransaction);
}

export class DuplicateTransactionError extends Error {
  constructor() {
    super("A transaction with the same details already exists.");
    this.name = "DuplicateTransactionError";
  }
}

export async function insertTransaction(
  input: InsertTransactionInput,
  tx?: DatabaseAdapter,
): Promise<TransactionRecord> {
  const db = tx ?? (await getDb());
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const attachment = input.attachment;

  try {
    await db.execute(
      `INSERT INTO transactions (
        id, user_id, category, amount_cents, transaction_date, platform, description,
        metadata_json, attachment_filename, attachment_stored_name, attachment_mime,
        attachment_size, fingerprint, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.userId,
        input.category,
        input.amountCents,
        input.transactionDate,
        input.platform,
        input.description,
        JSON.stringify(input.metadata),
        attachment?.filename ?? null,
        attachment?.storedName ?? null,
        attachment?.mimeType ?? null,
        attachment?.size ?? null,
        input.fingerprint,
        createdAt,
      ],
    );
  } catch (error) {
    if (isUniqueViolation(error, "fingerprint")) {
      throw new DuplicateTransactionError();
    }
    throw error;
  }

  const created = tx
    ? await (async () => {
        const row = await tx.queryOne<Row>(
          "SELECT * FROM transactions WHERE id = ? AND user_id = ?",
          [id, input.userId],
        );
        return row ? toTransaction(row) : null;
      })()
    : await findTransactionById(input.userId, id);
  if (!created) {
    throw new Error("Transaction insert succeeded but retrieval failed.");
  }
  return created;
}

export async function getTransactionSummary(userId: string): Promise<TransactionSummary> {
  const db = await getDb();
  const totals = await db.queryOne<Row>(
    `SELECT
       COUNT(*) AS total,
       COALESCE(SUM(amount_cents), 0) AS amount,
       COUNT(DISTINCT category) AS categories,
       COALESCE(SUM(CASE WHEN attachment_stored_name IS NOT NULL THEN 1 ELSE 0 END), 0) AS attachments,
       MAX(transaction_date) AS latest
     FROM transactions WHERE user_id = ?`,
    [userId],
  );

  const categoryRows = await db.query<Row>(
    `SELECT category, COUNT(*) AS count, COALESCE(SUM(amount_cents), 0) AS amount
     FROM transactions WHERE user_id = ?
     GROUP BY category`,
    [userId],
  );

  const recentRows = await db.query<Row>(
    `SELECT * FROM transactions
     WHERE user_id = ?
     ORDER BY transaction_date DESC, created_at DESC
     LIMIT 5`,
    [userId],
  );

  return {
    totalTransactions: asNumber(totals?.total),
    totalAmountCents: asNumber(totals?.amount),
    categoriesUsed: asNumber(totals?.categories),
    attachments: asNumber(totals?.attachments),
    categoryBreakdown: categoryRows.map((row) => ({
      category: asString(row.category) as PaymentCategory,
      count: asNumber(row.count),
      amountCents: asNumber(row.amount),
    })),
    recentTransactions: recentRows.map(toTransaction),
    latestTransactionDate: asNullableString(totals?.latest),
  };
}
