import { getDb } from "./index";
import type { LenderOrganizationRecord } from "@/models/production";

type Row = Record<string, unknown>;

function toOrganization(row: Row): LenderOrganizationRecord {
  return {
    id: String(row.id ?? ""),
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    status: String(row.status ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

export async function findOrganizationForUser(
  userId: string,
): Promise<{ organization: LenderOrganizationRecord; role: string } | null> {
  const db = await getDb();
  const row = await db.queryOne<Row>(
    `SELECT o.*, m.role AS member_role
     FROM organization_members m
     JOIN lender_organizations o ON o.id = m.organization_id
     WHERE m.user_id = ? AND o.status = 'active'
     ORDER BY m.created_at ASC
     LIMIT 1`,
    [userId],
  );
  if (!row) return null;
  return {
    organization: toOrganization(row),
    role: String(row.member_role ?? "viewer"),
  };
}

export async function listOrganizations(): Promise<LenderOrganizationRecord[]> {
  const db = await getDb();
  const rows = await db.query<Row>(
    "SELECT * FROM lender_organizations ORDER BY created_at ASC",
  );
  return rows.map(toOrganization);
}
