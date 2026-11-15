import { randomUUID } from "node:crypto";
import { getDb } from "./index";
import type { DatabaseAdapter } from "./adapter";
import type { AuditLogRecord, Paginated, Pagination } from "@/models/production";

type Row = Record<string, unknown>;

function parseMetadata(value: unknown): Record<string, unknown> {
  if (typeof value !== "string") return {};
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
}

function toAudit(row: Row): AuditLogRecord {
  return {
    id: String(row.id ?? ""),
    actorId: typeof row.actor_id === "string" ? row.actor_id : null,
    actorRole: typeof row.actor_role === "string" ? row.actor_role : null,
    action: String(row.action ?? ""),
    targetType: String(row.target_type ?? ""),
    targetId: typeof row.target_id === "string" ? row.target_id : null,
    requestId: typeof row.request_id === "string" ? row.request_id : null,
    metadata: parseMetadata(row.metadata_json),
    createdAt: String(row.created_at ?? ""),
  };
}

export function requestIdFor(request: Request): string {
  return request.headers.get("x-request-id")?.slice(0, 120) || randomUUID();
}

export async function recordAudit(
  input: {
    actorId: string | null;
    actorRole: string | null;
    action: string;
    targetType?: string;
    targetId?: string | null;
    requestId?: string | null;
    metadata?: Record<string, unknown>;
  },
  tx?: DatabaseAdapter,
): Promise<void> {
  const db = tx ?? (await getDb());
  await db.execute(
    `INSERT INTO audit_logs (
       id, actor_id, actor_role, action, target_type, target_id, request_id,
       metadata_json, created_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      randomUUID(),
      input.actorId,
      input.actorRole,
      input.action,
      input.targetType ?? "",
      input.targetId ?? null,
      input.requestId ?? null,
      JSON.stringify(input.metadata ?? {}),
      new Date().toISOString(),
    ],
  );
}

export async function listAuditLogs(
  pagination: Pagination,
  filters: { action?: string; actorId?: string } = {},
): Promise<Paginated<AuditLogRecord>> {
  const db = await getDb();
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (filters.action) {
    clauses.push("action = ?");
    params.push(filters.action);
  }
  if (filters.actorId) {
    clauses.push("actor_id = ?");
    params.push(filters.actorId);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await db.query<Row>(
    `SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, pagination.limit, pagination.offset],
  );
  const total = await db.queryOne<{ count: number | bigint | string }>(
    `SELECT COUNT(*) AS count FROM audit_logs ${where}`,
    params,
  );
  return {
    items: rows.map(toAudit),
    total: Number(total?.count ?? 0),
    limit: pagination.limit,
    offset: pagination.offset,
  };
}
