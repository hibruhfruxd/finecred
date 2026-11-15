import { getDb } from "./index";
import type { LenderApplicantRecord } from "@/models/production";

type Row = Record<string, unknown>;

function toApplicant(row: Row): LenderApplicantRecord {
  return {
    id: String(row.id ?? ""),
    email: String(row.email ?? ""),
    fullName: String(row.full_name ?? ""),
    status: String(row.status ?? ""),
    consentExpiry: typeof row.consent_expiry === "string" ? row.consent_expiry : null,
    latestScore: row.latest_score === null || row.latest_score === undefined
      ? null
      : Number(row.latest_score),
    latestReportAt:
      typeof row.latest_report_at === "string" ? row.latest_report_at : null,
    transactionCount: Number(row.transaction_count ?? 0),
  };
}

export async function listLenderApplicants(
  lenderId: string,
): Promise<LenderApplicantRecord[]> {
  const db = await getDb();
  const now = new Date().toISOString();
  const rows = await db.query<Row>(
    `SELECT u.id, u.email, u.full_name, u.status,
       (SELECT MAX(c.expires_at) FROM consents c
        WHERE c.user_id = u.id AND c.lender_id = ? AND c.status = 'granted') AS consent_expiry,
       (SELECT r.score FROM reports r WHERE r.user_id = u.id
        ORDER BY r.created_at DESC LIMIT 1) AS latest_score,
       (SELECT r.created_at FROM reports r WHERE r.user_id = u.id
        ORDER BY r.created_at DESC LIMIT 1) AS latest_report_at,
       (SELECT COUNT(*) FROM transactions t WHERE t.user_id = u.id) AS transaction_count
     FROM users u
     WHERE u.status = 'active'
       AND EXISTS (
         SELECT 1 FROM consents c
         WHERE c.user_id = u.id AND c.lender_id = ? AND c.status = 'granted'
           AND (c.expires_at IS NULL OR c.expires_at > ?)
       )
     ORDER BY u.full_name ASC`,
    [lenderId, lenderId, now],
  );
  return rows.map(toApplicant);
}

export async function findLenderApplicant(
  lenderId: string,
  applicantId: string,
): Promise<LenderApplicantRecord | null> {
  const applicants = await listLenderApplicants(lenderId);
  return applicants.find((applicant) => applicant.id === applicantId) ?? null;
}
