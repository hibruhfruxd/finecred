import { createHash, randomUUID } from "node:crypto";
import { getDb } from "./index";
import type { Paginated, Pagination, ReportRecord } from "@/models/production";
import { DEMO_DISCLAIMER } from "@/models/domain";
import type { AssessmentResponseDto } from "@/models/api";

export const REPORT_VERSION = "FC-REPORT-1.0";
export const REPORT_RETENTION_DAYS = 365;

type Row = Record<string, unknown>;

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  return `{${entries
    .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
    .join(",")}}`;
}

function parseAssessment(value: unknown): unknown {
  if (typeof value !== "string") return {};
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return {};
  }
}

function toReport(row: Row): ReportRecord {
  return {
    id: String(row.id ?? ""),
    userId: String(row.user_id ?? ""),
    applicantName: String(row.applicant_name ?? ""),
    applicantEmail: String(row.applicant_email ?? ""),
    requestedBy: String(row.requested_by ?? ""),
    requestedByName: String(row.requested_by_name ?? ""),
    reportType: String(row.report_type ?? ""),
    status: String(row.status ?? "") as ReportRecord["status"],
    score: row.score === null || row.score === undefined ? null : Number(row.score),
    band: String(row.band ?? ""),
    reportVersion: String(row.report_version ?? ""),
    assessment: parseAssessment(row.assessment_json),
    contentSha256: String(row.content_sha256 ?? ""),
    createdAt: String(row.created_at ?? ""),
    expiresAt: typeof row.expires_at === "string" ? row.expires_at : null,
  };
}

const SELECT_REPORT = `
  SELECT r.*, a.full_name AS applicant_name, a.email AS applicant_email,
         q.full_name AS requested_by_name
  FROM reports r
  JOIN users a ON a.id = r.user_id
  JOIN users q ON q.id = r.requested_by
`;

export async function createReport(input: {
  userId: string;
  requestedBy: string;
  reportType?: string;
  assessment: AssessmentResponseDto;
}): Promise<ReportRecord> {
  const db = await getDb();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(
    Date.now() + REPORT_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();
  const reportType = input.reportType ?? "assessment";
  const payload = {
    userId: input.userId,
    requestedBy: input.requestedBy,
    reportType,
    reportVersion: REPORT_VERSION,
    createdAt,
    disclaimer: DEMO_DISCLAIMER,
    assessment: input.assessment,
  };
  const contentSha256 = createHash("sha256")
    .update(stableStringify(payload))
    .digest("hex");

  await db.execute(
    `INSERT INTO reports (
       id, user_id, requested_by, report_type, status, score, band, report_version,
       assessment_json, content_sha256, created_at, expires_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.userId,
      input.requestedBy,
      reportType,
      input.assessment.status,
      input.assessment.score,
      input.assessment.band,
      REPORT_VERSION,
      JSON.stringify(input.assessment),
      contentSha256,
      createdAt,
      expiresAt,
    ],
  );

  const report = await findReportById(id);
  if (!report) throw new Error("Report insert succeeded but retrieval failed.");
  return report;
}

export async function findReportById(id: string): Promise<ReportRecord | null> {
  const db = await getDb();
  const row = await db.queryOne<Row>(`${SELECT_REPORT} WHERE r.id = ?`, [id]);
  return row ? toReport(row) : null;
}

export async function listReportsForUser(userId: string): Promise<ReportRecord[]> {
  const db = await getDb();
  const rows = await db.query<Row>(
    `${SELECT_REPORT} WHERE r.user_id = ? ORDER BY r.created_at DESC`,
    [userId],
  );
  return rows.map(toReport);
}

export async function listReportsForLender(lenderId: string): Promise<ReportRecord[]> {
  const db = await getDb();
  const now = new Date().toISOString();
  const rows = await db.query<Row>(
    `${SELECT_REPORT}
     WHERE r.user_id IN (
       SELECT c.user_id FROM consents c
       WHERE c.lender_id = ? AND c.status = 'granted'
         AND (c.expires_at IS NULL OR c.expires_at > ?)
     )
     ORDER BY r.created_at DESC`,
    [lenderId, now],
  );
  return rows.map(toReport);
}

export async function findReportForLender(
  reportId: string,
  lenderId: string,
): Promise<ReportRecord | null> {
  const db = await getDb();
  const now = new Date().toISOString();
  const row = await db.queryOne<Row>(
    `${SELECT_REPORT}
     WHERE r.id = ? AND r.user_id IN (
       SELECT c.user_id FROM consents c
       WHERE c.lender_id = ? AND c.status = 'granted'
         AND (c.expires_at IS NULL OR c.expires_at > ?)
     )`,
    [reportId, lenderId, now],
  );
  return row ? toReport(row) : null;
}

export async function listAllReports(
  pagination: Pagination,
): Promise<Paginated<ReportRecord>> {
  const db = await getDb();
  const rows = await db.query<Row>(
    `${SELECT_REPORT} ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
    [pagination.limit, pagination.offset],
  );
  const total = await db.queryOne<{ count: number | bigint | string }>(
    "SELECT COUNT(*) AS count FROM reports",
  );
  return {
    items: rows.map(toReport),
    total: Number(total?.count ?? 0),
    limit: pagination.limit,
    offset: pagination.offset,
  };
}

export async function countReports(): Promise<number> {
  const db = await getDb();
  const row = await db.queryOne<{ count: number | bigint | string }>(
    "SELECT COUNT(*) AS count FROM reports",
  );
  return Number(row?.count ?? 0);
}
