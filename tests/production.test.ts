import { beforeEach, describe, expect, it } from "vitest";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as refresh } from "@/app/api/auth/refresh/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { GET as listConsents, POST as createConsent } from "@/app/api/consents/route";
import { PATCH as updateConsent } from "@/app/api/consents/[id]/route";
import { GET as listReports, POST as createReport } from "@/app/api/reports/route";
import { GET as getReport } from "@/app/api/reports/[id]/route";
import { GET as listSynthetic, POST as generateSynthetic } from "@/app/api/synthetic-data/route";
import { GET as listApplicants } from "@/app/api/lender/applicants/route";
import { GET as getApplicant } from "@/app/api/lender/applicants/[id]/route";
import { GET as listNotes, POST as createNote } from "@/app/api/lender/applicants/[id]/notes/route";
import { GET as lenderReports, POST as createLenderReport } from "@/app/api/lender/reports/route";
import { GET as lenderConsents } from "@/app/api/lender/consents/route";
import { GET as adminOverview } from "@/app/api/admin/overview/route";
import { GET as adminUsers } from "@/app/api/admin/users/route";
import { PATCH as adminUpdateUser } from "@/app/api/admin/users/[id]/route";
import { GET as adminAuditLogs } from "@/app/api/admin/audit-logs/route";
import { resetDatabase, getDb } from "@/backend/db";
import { findUserByEmail } from "@/backend/db/repository";
import { issueRefreshToken } from "@/backend/auth/refresh";

const BASE_URL = "http://localhost";
const CONSUMER = { email: "consumer@fincred.demo", password: "Demo@123" };
const LENDER = { email: "lender@fincred.demo", password: "Demo@123" };
const ADMIN = { email: "admin@fincred.demo", password: "Demo@123" };

function request(pathname: string, init: RequestInit = {}): Request {
  return new Request(`${BASE_URL}${pathname}`, init);
}

function setCookies(response: Response): string[] {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  return headers.getSetCookie?.() ?? [response.headers.get("set-cookie") ?? ""];
}

function cookieMap(response: Response): Map<string, string> {
  const map = new Map<string, string>();
  for (const header of setCookies(response)) {
    const pair = header.split(";")[0];
    const separator = pair.indexOf("=");
    if (separator > 0) map.set(pair.slice(0, separator), pair.slice(separator + 1));
  }
  return map;
}

function cookieHeader(response: Response, names: string[]): string {
  const map = cookieMap(response);
  return names
    .filter((name) => map.has(name))
    .map((name) => `${name}=${map.get(name)}`)
    .join("; ");
}

async function loginAs(credentials: { email: string; password: string }) {
  const response = await login(
    request("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json", "user-agent": "vitest" },
      body: JSON.stringify(credentials),
    }),
  );
  expect(response.status).toBe(200);
  return { response, cookies: cookieMap(response) };
}

function authCookie(response: Response): string {
  return cookieHeader(response, ["fincred_session"]);
}

function futureDate(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

beforeEach(async () => {
  await resetDatabase();
});

describe("production backend flows", () => {
  it("stores Argon2id hashes and rotates refresh tokens with reuse detection", async () => {
    const consumer = await findUserByEmail(CONSUMER.email);
    expect(consumer?.passwordHash.startsWith("argon2id$v=19$")).toBe(true);

    const session = await loginAs(CONSUMER);
    expect(session.cookies.get("fincred_session")).toBeTruthy();
    expect(session.cookies.get("fincred_refresh")).toBeTruthy();
    const firstRefresh = session.cookies.get("fincred_refresh") as string;

    const rotated = await refresh(
      request("/api/auth/refresh", {
        method: "POST",
        headers: { cookie: `fincred_refresh=${firstRefresh}` },
      }),
    );
    expect(rotated.status).toBe(200);
    const rotatedCookies = cookieMap(rotated);
    const secondRefresh = rotatedCookies.get("fincred_refresh");
    expect(secondRefresh).toBeTruthy();
    expect(secondRefresh).not.toBe(firstRefresh);

    const reuse = await refresh(
      request("/api/auth/refresh", {
        method: "POST",
        headers: { cookie: `fincred_refresh=${firstRefresh}` },
      }),
    );
    expect(reuse.status).toBe(401);
    expect((await reuse.json()).error.code).toBe("refresh_token_reused");

    const familyRevoked = await refresh(
      request("/api/auth/refresh", {
        method: "POST",
        headers: { cookie: `fincred_refresh=${secondRefresh}` },
      }),
    );
    expect(familyRevoked.status).toBe(401);
  });

  it("persists consents, lender notes, reports, synthetic jobs, and audit events", async () => {
    const consumer = await loginAs(CONSUMER);
    const lender = await loginAs(LENDER);
    const admin = await loginAs(ADMIN);

    const consentResponse = await createConsent(
      request("/api/consents", {
        method: "POST",
        headers: {
          cookie: authCookie(consumer.response),
          "content-type": "application/json",
        },
        body: JSON.stringify({
          purpose: "API assessment sharing",
          description: "Production flow test consent.",
          lender_email: LENDER.email,
          scope: ["assessment", "payment_summary", "report"],
          expires_at: futureDate(30),
        }),
      }),
    );
    expect(consentResponse.status).toBe(201);
    const consent = (await consentResponse.json()).consent;
    expect(consent.status).toBe("granted");
    expect(consent.lenderEmail).toBe(LENDER.email);

    const ownConsents = await listConsents(
      request("/api/consents", { headers: { cookie: authCookie(consumer.response) } }),
    );
    expect((await ownConsents.json()).consents.length).toBeGreaterThanOrEqual(3);

    const withdrawn = await updateConsent(
      request(`/api/consents/${consent.id}`, {
        method: "PATCH",
        headers: {
          cookie: authCookie(consumer.response),
          "content-type": "application/json",
        },
        body: JSON.stringify({ status: "withdrawn" }),
      }),
      { params: Promise.resolve({ id: consent.id }) },
    );
    expect(withdrawn.status).toBe(200);
    expect((await withdrawn.json()).consent.status).toBe("withdrawn");

    const stillSeededApplicants = await listApplicants(
      request("/api/lender/applicants", {
        headers: { cookie: authCookie(lender.response) },
      }),
    );
    expect(stillSeededApplicants.status).toBe(200);
    const applicants = (await stillSeededApplicants.json()).applicants as Array<{
      id: string;
      email: string;
    }>;
    const applicant = applicants.find((item) => item.email === CONSUMER.email);
    expect(applicant).toBeTruthy();
    const applicantId = applicant?.id as string;

    const applicantDetail = await getApplicant(
      request(`/api/lender/applicants/${applicantId}`, {
        headers: { cookie: authCookie(lender.response) },
      }),
      { params: Promise.resolve({ id: applicantId }) },
    );
    expect(applicantDetail.status).toBe(200);
    expect(
      typeof (await applicantDetail.json()).paymentSummary.totalTransactions,
    ).toBe("number");

    const noteResponse = await createNote(
      request(`/api/lender/applicants/${applicantId}/notes`, {
        method: "POST",
        headers: {
          cookie: authCookie(lender.response),
          "content-type": "application/json",
        },
        body: JSON.stringify({ body: "Synthetic review note persisted by test." }),
      }),
      { params: Promise.resolve({ id: applicantId }) },
    );
    expect(noteResponse.status).toBe(201);
    expect((await noteResponse.json()).note.body).toContain("persisted");

    const notes = await listNotes(
      request(`/api/lender/applicants/${applicantId}/notes`, {
        headers: { cookie: authCookie(lender.response) },
      }),
      { params: Promise.resolve({ id: applicantId }) },
    );
    expect((await notes.json()).notes).toHaveLength(1);

    const lenderConsentList = await lenderConsents(
      request("/api/lender/consents", {
        headers: { cookie: authCookie(lender.response) },
      }),
    );
    expect(lenderConsentList.status).toBe(200);
    expect((await lenderConsentList.json()).consents.length).toBeGreaterThan(0);

    const reportResponse = await createLenderReport(
      request("/api/lender/reports", {
        method: "POST",
        headers: {
          cookie: authCookie(lender.response),
          "content-type": "application/json",
        },
        body: JSON.stringify({ applicant_id: applicantId, lookback_months: 6 }),
      }),
    );
    expect(reportResponse.status).toBe(201);
    const report = (await reportResponse.json()).report;
    expect(report.reportVersion).toBe("FC-REPORT-1.0");
    expect(report.contentSha256).toHaveLength(64);

    const detail = await getReport(
      request(`/api/reports/${report.id}`, {
        headers: { cookie: authCookie(lender.response) },
      }),
      { params: Promise.resolve({ id: report.id }) },
    );
    expect(detail.status).toBe(200);
    expect((await detail.json()).immutable).toBe(true);

    const lenderReportList = await lenderReports(
      request("/api/lender/reports", {
        headers: { cookie: authCookie(lender.response) },
      }),
    );
    expect((await lenderReportList.json()).reports).toHaveLength(1);

    const consumerReports = await listReports(
      request("/api/reports", { headers: { cookie: authCookie(consumer.response) } }),
    );
    expect((await consumerReports.json()).reports).toHaveLength(1);

    const synthetic = await generateSynthetic(
      request("/api/synthetic-data", {
        method: "POST",
        headers: {
          cookie: authCookie(consumer.response),
          "content-type": "application/json",
        },
        body: JSON.stringify({
          categories: ["rent", "electricity", "mobile"],
          record_count: 6,
          lookback_months: 3,
        }),
      }),
    );
    expect(synthetic.status).toBe(201);
    const job = (await synthetic.json()).job;
    expect(job.status).toBe("completed");
    expect(job.result.generatedCount).toBe(6);

    const jobs = await listSynthetic(
      request("/api/synthetic-data", {
        headers: { cookie: authCookie(consumer.response) },
      }),
    );
    expect((await jobs.json()).jobs).toHaveLength(1);

    const overview = await adminOverview(
      request("/api/admin/overview", { headers: { cookie: authCookie(admin.response) } }),
    );
    expect(overview.status).toBe(200);
    expect((await overview.json()).overview.reports).toBe(1);

    const users = await adminUsers(
      request("/api/admin/users", { headers: { cookie: authCookie(admin.response) } }),
    );
    expect(users.status).toBe(200);
    expect((await users.json()).total).toBe(3);

    const adminSelf = await adminUsers(
      request("/api/admin/users?q=admin", {
        headers: { cookie: authCookie(admin.response) },
      }),
    );
    const adminId = (await adminSelf.json()).items[0].id as string;
    const selfLockout = await adminUpdateUser(
      request(`/api/admin/users/${adminId}`, {
        method: "PATCH",
        headers: {
          cookie: authCookie(admin.response),
          "content-type": "application/json",
        },
        body: JSON.stringify({ status: "disabled" }),
      }),
      { params: Promise.resolve({ id: adminId }) },
    );
    expect(selfLockout.status).toBe(400);

    const audit = await adminAuditLogs(
      request("/api/admin/audit-logs", {
        headers: { cookie: authCookie(admin.response) },
      }),
    );
    expect(audit.status).toBe(200);
    expect((await audit.json()).total).toBeGreaterThanOrEqual(4);

    const db = await getDb();
    await expect(
      db.execute("UPDATE reports SET score = 1 WHERE id = ?", [report.id]),
    ).rejects.toThrow();
  });

  it("blocks disabled accounts at login, refresh, and protected endpoints", async () => {
    const admin = await loginAs(ADMIN);
    const lender = await loginAs(LENDER);

    const users = await adminUsers(
      request("/api/admin/users?q=lender", {
        headers: { cookie: authCookie(admin.response) },
      }),
    );
    const lenderId = (await users.json()).items[0].id as string;
    const disabled = await adminUpdateUser(
      request(`/api/admin/users/${lenderId}`, {
        method: "PATCH",
        headers: {
          cookie: authCookie(admin.response),
          "content-type": "application/json",
        },
        body: JSON.stringify({ status: "disabled" }),
      }),
      { params: Promise.resolve({ id: lenderId }) },
    );
    expect(disabled.status).toBe(200);

    const blockedLogin = await login(
      request("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(LENDER),
      }),
    );
    expect(blockedLogin.status).toBe(403);
    expect((await blockedLogin.json()).error.code).toBe("account_disabled");

    const lenderRefresh = lender.cookies.get("fincred_refresh") as string;
    const revokedRefresh = await refresh(
      request("/api/auth/refresh", {
        method: "POST",
        headers: { cookie: `fincred_refresh=${lenderRefresh}` },
      }),
    );
    expect(revokedRefresh.status).toBe(401);
    expect((await revokedRefresh.json()).error.code).toBe("invalid_refresh_token");

    const orphanedToken = await issueRefreshToken(lenderId, {
      userAgent: "vitest",
      ipHash: "test-ip-hash",
    });
    const blockedRefresh = await refresh(
      request("/api/auth/refresh", {
        method: "POST",
        headers: { cookie: `fincred_refresh=${orphanedToken.rawToken}` },
      }),
    );
    expect(blockedRefresh.status).toBe(403);
    expect((await blockedRefresh.json()).error.code).toBe("account_disabled");

    const blockedAccess = await listConsents(
      request("/api/consents", {
        headers: { cookie: authCookie(lender.response) },
      }),
    );
    expect(blockedAccess.status).toBe(403);
    expect((await blockedAccess.json()).error.code).toBe("account_disabled");
  });

  it("revokes lender access when consent is withdrawn", async () => {
    const consumer = await loginAs(CONSUMER);
    const lender = await loginAs(LENDER);

    const applicantsResponse = await listApplicants(
      request("/api/lender/applicants", {
        headers: { cookie: authCookie(lender.response) },
      }),
    );
    const applicants = (await applicantsResponse.json()).applicants as Array<{ id: string; email: string }>;
    const applicant = applicants.find((item) => item.email === CONSUMER.email);
    expect(applicant).toBeTruthy();
    const applicantId = applicant?.id as string;

    const reportResponse = await createLenderReport(
      request("/api/lender/reports", {
        method: "POST",
        headers: {
          cookie: authCookie(lender.response),
          "content-type": "application/json",
        },
        body: JSON.stringify({ applicant_id: applicantId, lookback_months: 6 }),
      }),
    );
    expect(reportResponse.status).toBe(201);
    const reportId = (await reportResponse.json()).report.id as string;

    const beforeWithdrawal = await lenderReports(
      request("/api/lender/reports", {
        headers: { cookie: authCookie(lender.response) },
      }),
    );
    expect((await beforeWithdrawal.json()).reports).toHaveLength(1);

    const consentsResponse = await listConsents(
      request("/api/consents", {
        headers: { cookie: authCookie(consumer.response) },
      }),
    );
    const consents = (await consentsResponse.json()).consents as Array<{
      id: string;
      status: string;
      lenderEmail: string | null;
    }>;
    const lenderConsents = consents.filter(
      (consent) => consent.status === "granted" && consent.lenderEmail === LENDER.email,
    );
    expect(lenderConsents.length).toBeGreaterThan(0);
    for (const consent of lenderConsents) {
      const withdrawn = await updateConsent(
        request(`/api/consents/${consent.id}`, {
          method: "PATCH",
          headers: {
            cookie: authCookie(consumer.response),
            "content-type": "application/json",
          },
          body: JSON.stringify({ status: "withdrawn" }),
        }),
        { params: Promise.resolve({ id: consent.id }) },
      );
      expect(withdrawn.status).toBe(200);
    }

    const afterWithdrawal = await lenderReports(
      request("/api/lender/reports", {
        headers: { cookie: authCookie(lender.response) },
      }),
    );
    expect((await afterWithdrawal.json()).reports).toHaveLength(0);

    const blockedApplicants = await listApplicants(
      request("/api/lender/applicants", {
        headers: { cookie: authCookie(lender.response) },
      }),
    );
    expect(
      (await blockedApplicants.json()).applicants.some(
        (item: { email: string }) => item.email === CONSUMER.email,
      ),
    ).toBe(false);

    const blockedReport = await getReport(
      request(`/api/reports/${reportId}`, {
        headers: { cookie: authCookie(lender.response) },
      }),
      { params: Promise.resolve({ id: reportId }) },
    );
    expect(blockedReport.status).toBe(404);

    const consumerReports = await listReports(
      request("/api/reports", {
        headers: { cookie: authCookie(consumer.response) },
      }),
    );
    expect((await consumerReports.json()).reports).toHaveLength(1);
  });
});
