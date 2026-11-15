import { randomUUID } from "node:crypto";
import { getDb } from "./index";
import type { LenderNoteRecord } from "@/models/production";

type Row = Record<string, unknown>;

function toNote(row: Row): LenderNoteRecord {
  return {
    id: String(row.id ?? ""),
    lenderId: String(row.lender_id ?? ""),
    lenderName: String(row.lender_name ?? ""),
    applicantId: String(row.applicant_id ?? ""),
    applicantName: String(row.applicant_name ?? ""),
    applicantEmail: String(row.applicant_email ?? ""),
    organizationId:
      typeof row.organization_id === "string" ? row.organization_id : null,
    body: String(row.body ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  };
}

const SELECT_NOTE = `
  SELECT n.*, l.full_name AS lender_name, a.full_name AS applicant_name,
         a.email AS applicant_email
  FROM lender_notes n
  JOIN users l ON l.id = n.lender_id
  JOIN users a ON a.id = n.applicant_id
`;

export async function createLenderNote(input: {
  lenderId: string;
  applicantId: string;
  organizationId: string | null;
  body: string;
}): Promise<LenderNoteRecord> {
  const db = await getDb();
  const id = randomUUID();
  const now = new Date().toISOString();
  await db.execute(
    `INSERT INTO lender_notes (
       id, lender_id, applicant_id, organization_id, body, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, input.lenderId, input.applicantId, input.organizationId, input.body, now, now],
  );
  const created = await db.queryOne<Row>(`${SELECT_NOTE} WHERE n.id = ?`, [id]);
  if (!created) throw new Error("Lender note insert succeeded but retrieval failed.");
  return toNote(created);
}

export async function listLenderNotes(
  applicantId: string,
  lenderId?: string,
): Promise<LenderNoteRecord[]> {
  const db = await getDb();
  const rows = lenderId
    ? await db.query<Row>(
        `${SELECT_NOTE} WHERE n.applicant_id = ? AND n.lender_id = ?
         ORDER BY n.created_at DESC`,
        [applicantId, lenderId],
      )
    : await db.query<Row>(
        `${SELECT_NOTE} WHERE n.applicant_id = ? ORDER BY n.created_at DESC`,
        [applicantId],
      );
  return rows.map(toNote);
}

export async function deleteLenderNote(
  id: string,
  lenderId: string,
): Promise<boolean> {
  const db = await getDb();
  const result = await db.execute("DELETE FROM lender_notes WHERE id = ? AND lender_id = ?", [
    id,
    lenderId,
  ]);
  return result.changes > 0;
}
