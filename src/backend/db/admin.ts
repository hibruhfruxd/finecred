import { getDb } from "./index";
import type {
  AdminOverview,
  AdminPaymentSummary,
  AdminUserSummary,
  Paginated,
  Pagination,
} from "@/models/production";

type Row = Record<string, unknown>;

function toAdminUser(row: Row): AdminUserSummary {
  return {
    id: String(row.id ?? ""),
    email: String(row.email ?? ""),
    fullName: String(row.full_name ?? ""),
    role: String(row.role ?? ""),
    status: String(row.status ?? ""),
    createdAt: String(row.created_at ?? ""),
    transactionCount: Number(row.transaction_count ?? 0),
    reportCount: Number(row.report_count ?? 0),
    consentCount: Number(row.consent_count ?? 0),
  };
}

function toAdminPayment(row: Row): AdminPaymentSummary {
  return {
    id: String(row.id ?? ""),
    userId: String(row.user_id ?? ""),
    userEmail: String(row.user_email ?? ""),
    userName: String(row.user_name ?? ""),
    category: String(row.category ?? ""),
    amount: Number(row.amount_cents ?? 0) / 100,
    transactionDate: String(row.transaction_date ?? ""),
    platform: String(row.platform ?? ""),
    description: String(row.description ?? ""),
    createdAt: String(row.created_at ?? ""),
  };
}

export async function listAdminUsers(
  pagination: Pagination,
  filters: { role?: string; status?: string; q?: string } = {},
): Promise<Paginated<AdminUserSummary>> {
  const db = await getDb();
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (filters.role) {
    clauses.push("u.role = ?");
    params.push(filters.role);
  }
  if (filters.status) {
    clauses.push("u.status = ?");
    params.push(filters.status);
  }
  if (filters.q) {
    clauses.push("(LOWER(u.email) LIKE ? OR LOWER(u.full_name) LIKE ?)");
    const like = `%${filters.q.toLowerCase()}%`;
    params.push(like, like);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await db.query<Row>(
    `SELECT u.*,
       (SELECT COUNT(*) FROM transactions t WHERE t.user_id = u.id) AS transaction_count,
       (SELECT COUNT(*) FROM reports r WHERE r.user_id = u.id) AS report_count,
       (SELECT COUNT(*) FROM consents c WHERE c.user_id = u.id) AS consent_count
     FROM users u
     ${where}
     ORDER BY u.created_at ASC
     LIMIT ? OFFSET ?`,
    [...params, pagination.limit, pagination.offset],
  );
  const total = await db.queryOne<{ count: number | bigint | string }>(
    `SELECT COUNT(*) AS count FROM users u ${where}`,
    params,
  );
  return {
    items: rows.map(toAdminUser),
    total: Number(total?.count ?? 0),
    limit: pagination.limit,
    offset: pagination.offset,
  };
}

export async function updateUserRoleStatus(
  userId: string,
  input: { role?: string; status?: string },
): Promise<void> {
  const db = await getDb();
  const assignments: string[] = [];
  const params: unknown[] = [];
  if (input.role) {
    assignments.push("role = ?");
    params.push(input.role);
  }
  if (input.status) {
    assignments.push("status = ?");
    params.push(input.status);
    assignments.push("disabled_at = ?");
    params.push(input.status === "disabled" ? new Date().toISOString() : null);
  }
  if (assignments.length === 0) return;
  assignments.push("auth_version = auth_version + 1");
  params.push(userId);
  await db.execute(`UPDATE users SET ${assignments.join(", ")} WHERE id = ?`, params);
}

export async function countActiveAdmins(): Promise<number> {
  const db = await getDb();
  const row = await db.queryOne<{ count: number | bigint | string }>(
    "SELECT COUNT(*) AS count FROM users WHERE role = 'admin' AND status = 'active'",
  );
  return Number(row?.count ?? 0);
}

export async function listAdminPayments(
  pagination: Pagination,
  filters: { category?: string; q?: string } = {},
): Promise<Paginated<AdminPaymentSummary>> {
  const db = await getDb();
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (filters.category) {
    clauses.push("t.category = ?");
    params.push(filters.category);
  }
  if (filters.q) {
    clauses.push("(LOWER(u.email) LIKE ? OR LOWER(u.full_name) LIKE ? OR LOWER(t.description) LIKE ?)");
    const like = `%${filters.q.toLowerCase()}%`;
    params.push(like, like, like);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await db.query<Row>(
    `SELECT t.*, u.email AS user_email, u.full_name AS user_name
     FROM transactions t
     JOIN users u ON u.id = t.user_id
     ${where}
     ORDER BY t.transaction_date DESC, t.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, pagination.limit, pagination.offset],
  );
  const total = await db.queryOne<{ count: number | bigint | string }>(
    `SELECT COUNT(*) AS count FROM transactions t JOIN users u ON u.id = t.user_id ${where}`,
    params,
  );
  return {
    items: rows.map(toAdminPayment),
    total: Number(total?.count ?? 0),
    limit: pagination.limit,
    offset: pagination.offset,
  };
}

async function scalar(sql: string, params: unknown[] = []): Promise<number> {
  const db = await getDb();
  const row = await db.queryOne<{ count: number | bigint | string }>(sql, params);
  return Number(row?.count ?? 0);
}

export async function getAdminOverview(): Promise<AdminOverview> {
  return {
    users: await scalar("SELECT COUNT(*) AS count FROM users"),
    consumers: await scalar("SELECT COUNT(*) AS count FROM users WHERE role = 'consumer'"),
    lenders: await scalar("SELECT COUNT(*) AS count FROM users WHERE role = 'lender'"),
    admins: await scalar("SELECT COUNT(*) AS count FROM users WHERE role = 'admin'"),
    disabledUsers: await scalar("SELECT COUNT(*) AS count FROM users WHERE status = 'disabled'"),
    transactions: await scalar("SELECT COUNT(*) AS count FROM transactions"),
    reports: await scalar("SELECT COUNT(*) AS count FROM reports"),
    activeConsents: await scalar("SELECT COUNT(*) AS count FROM consents WHERE status = 'granted'"),
    auditEvents: await scalar("SELECT COUNT(*) AS count FROM audit_logs"),
  };
}
