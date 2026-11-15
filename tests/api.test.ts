import { rmSync } from "node:fs";
import { beforeEach, describe, expect, it } from "vitest";
import { POST as generateAssessment } from "@/app/api/assessment/generate/route";
import { GET as listDemoAccounts } from "@/app/api/auth/demo-accounts/route";
import { POST as login } from "@/app/api/auth/login/route";
import { POST as logout } from "@/app/api/auth/logout/route";
import { GET as getCurrentUser } from "@/app/api/auth/me/route";
import { GET as health } from "@/app/api/health/route";
import { GET as listTransactions, POST as createTransaction } from "@/app/api/transactions/route";
import { GET as getTransaction } from "@/app/api/transactions/[id]/route";
import { GET as getAttachment } from "@/app/api/transactions/[id]/attachment/route";
import { GET as getSummary } from "@/app/api/transactions/summary/route";
import { registerAssessmentEngine, resetAssessmentEngine } from "@/backend/assessment";
import type { AssessmentEngine } from "@/backend/assessment";
import { resetDatabase } from "@/backend/db";
import { DEMO_DISCLAIMER, type PaymentCategory } from "@/models/domain";

const BASE_URL = "http://localhost";
const CLEAN_ACCOUNT = {
  email: "consumer@fincred.demo",
  password: "Demo@123",
};
const SAMPLE_ACCOUNT = {
  email: "lender@fincred.demo",
  password: "Demo@123",
};

interface CategoryInput {
  amount: number;
  date: string;
  description: string;
  platform: string;
  metadata: Record<string, string>;
}

function request(pathname: string, init: RequestInit = {}): Request {
  return new Request(`${BASE_URL}${pathname}`, init);
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - days);
  return date.toISOString().slice(0, 10);
}

function metadataFor(category: PaymentCategory, suffix: string): Record<string, string> {
  if (category === "rent") {
    return {
      landlord_reference: `LND-${suffix}`,
      rental_period: `Period ${suffix}`,
      payment_frequency: "Monthly",
    };
  }
  if (category === "electricity") {
    return {
      provider: "BrightGrid Power",
      billing_period: `Period ${suffix}`,
      consumer_reference: `SYNT-ELEC-${suffix}`,
    };
  }
  return {
    operator: "Northline Telecom",
    billing_type: "Prepaid Recharge",
    billing_period: `Period ${suffix}`,
  };
}

function inputFor(category: PaymentCategory, suffix: string): CategoryInput {
  return {
    amount: category === "rent" ? 25000 : category === "electricity" ? 1850 : 599,
    date: daysAgo(category === "rent" ? 20 : category === "electricity" ? 10 : 2),
    description: `Synthetic ${category} payment ${suffix}.`,
    platform: category === "rent" ? "Bank Transfer" : "UPI",
    metadata: metadataFor(category, suffix),
  };
}

function formFor(
  category: PaymentCategory,
  input: CategoryInput,
  file?: File,
): FormData {
  const form = new FormData();
  form.set("category", category);
  form.set("amount", String(input.amount));
  form.set("transaction_date", input.date);
  form.set("platform", input.platform);
  form.set("description", input.description);
  form.set("metadata", JSON.stringify(input.metadata));
  if (file) form.set("attachment", file);
  return form;
}

function pdfFile(name = "synthetic-proof.pdf"): File {
  return new File(
    ["%PDF-1.4\n% FinCred synthetic test document. Not a real financial record.\n%%EOF\n"],
    name,
    { type: "application/pdf" },
  );
}

function cookieFrom(response: Response): string {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  const cookie = headers.getSetCookie?.()[0] ?? response.headers.get("set-cookie");
  if (!cookie) throw new Error("Expected a session cookie.");
  return cookie.split(";")[0];
}

async function loginAs(credentials: { email: string; password: string }) {
  const response = await login(
    request("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(credentials),
    }),
  );
  expect(response.status).toBe(200);
  return { cookie: cookieFrom(response), body: await response.json() };
}

async function submitPayment(
  cookie: string,
  category: PaymentCategory,
  suffix: string,
  file?: File,
) {
  const response = await createTransaction(
    request("/api/transactions", {
      method: "POST",
      headers: { cookie },
      body: formFor(category, inputFor(category, suffix), file),
    }),
  );
  return { response, body: await response.json() };
}

function withContext<T>(
  id: string,
  cookie: string,
  handler: (
    request: Request,
    context: { params: Promise<{ id: string }> },
  ) => Promise<T>,
) {
  return handler(
    request(`/api/transactions/${id}`, { headers: { cookie } }),
    { params: Promise.resolve({ id }) },
  );
}

beforeEach(async () => {
  await resetDatabase();
  rmSync(process.env.FINCRED_UPLOAD_DIR as string, { recursive: true, force: true });
});

describe("FinCred demo API", () => {
  it("serves health, demo credentials, and authenticated account details", async () => {
    const healthResponse = await health();
    expect(healthResponse.status).toBe(200);
    expect(await healthResponse.json()).toMatchObject({
      status: "ok",
      mode: "synthetic-demo-only",
    });

    const accountsResponse = await listDemoAccounts();
    expect(accountsResponse.status).toBe(200);
    const accounts = (await accountsResponse.json()) as {
      accounts: Array<{ email: string; password: string }>;
      notice: string;
    };
    expect(accounts.accounts).toHaveLength(3);
    expect(accounts.notice).toContain("fictional demo-only credentials");

    const unauthenticated = await getCurrentUser(request("/api/auth/me"));
    expect(unauthenticated.status).toBe(401);
    expect((await unauthenticated.json()).error.code).toBe("unauthenticated");

    const { cookie, body } = await loginAs(CLEAN_ACCOUNT);
    expect(body.user).toMatchObject({
      email: CLEAN_ACCOUNT.email,
      fullName: "Aarav Mehta",
    });

    const meResponse = await getCurrentUser(
      request("/api/auth/me", { headers: { cookie } }),
    );
    expect(meResponse.status).toBe(200);
    expect((await meResponse.json()).user.email).toBe(CLEAN_ACCOUNT.email);
  });

  it("rejects invalid credentials and clears the cookie on logout", async () => {
    const badLogin = await login(
      request("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: CLEAN_ACCOUNT.email, password: "wrong-password" }),
      }),
    );
    expect(badLogin.status).toBe(401);
    expect((await badLogin.json()).error.code).toBe("invalid_credentials");

    const { cookie } = await loginAs(CLEAN_ACCOUNT);
    const logoutResponse = await logout(request("/api/auth/logout", { method: "POST" }));
    expect(logoutResponse.status).toBe(200);
    expect(cookieFrom(logoutResponse)).toBe("fincred_session=");
    expect(cookie).toContain("fincred_session=");
  });

  it("records a payment with an attachment and exposes it only to the owner", async () => {
    const { cookie } = await loginAs(CLEAN_ACCOUNT);
    const input = inputFor("rent", "1001");

    const created = await createTransaction(
      request("/api/transactions", {
        method: "POST",
        headers: { cookie },
        body: formFor("rent", input, pdfFile()),
      }),
    );
    expect(created.status).toBe(201);
    const createdBody = (await created.json()) as {
      transaction: {
        id: string;
        amount: number;
        category: string;
        attachment: { filename: string; mimeType: string } | null;
      };
    };
    expect(createdBody.transaction).toMatchObject({
      amount: 25000,
      category: "rent",
      attachment: { filename: "synthetic-proof.pdf", mimeType: "application/pdf" },
    });
    const transactionId = createdBody.transaction.id;

    const listResponse = await listTransactions(
      request("/api/transactions", { headers: { cookie } }),
    );
    expect(listResponse.status).toBe(200);
    const list = (await listResponse.json()) as { count: number };
    expect(list.count).toBe(1);

    const detailResponse = await withContext(transactionId, cookie, (req, context) =>
      getTransaction(req, context),
    );
    expect(detailResponse.status).toBe(200);

    const attachmentResponse = await withContext(transactionId, cookie, (req, context) =>
      getAttachment(req, context),
    );
    expect(attachmentResponse.status).toBe(200);
    expect(attachmentResponse.headers.get("content-type")).toBe("application/pdf");
    expect(attachmentResponse.headers.get("x-content-type-options")).toBe("nosniff");
    const attachmentBytes = Buffer.from(await attachmentResponse.arrayBuffer());
    expect(attachmentBytes.subarray(0, 5).toString("ascii")).toBe("%PDF-");

    const summaryResponse = await getSummary(
      request("/api/transactions/summary", { headers: { cookie } }),
    );
    expect(summaryResponse.status).toBe(200);
    const summary = (await summaryResponse.json()) as {
      totals: { transactions: number; attachments: number };
      assessment: { ready: boolean };
    };
    expect(summary.totals).toMatchObject({ transactions: 1, attachments: 1 });
    expect(summary.assessment.ready).toBe(false);

    const otherAccount = await loginAs(SAMPLE_ACCOUNT);
    const forbiddenDetail = await withContext(
      transactionId,
      otherAccount.cookie,
      (req, context) => getTransaction(req, context),
    );
    expect(forbiddenDetail.status).toBe(404);
    expect((await forbiddenDetail.json()).error.code).toBe("transaction_not_found");
  });

  it("rejects duplicates, invalid fields, future dates, and mismatched attachments", async () => {
    const { cookie } = await loginAs(CLEAN_ACCOUNT);
    const input = inputFor("electricity", "2002");

    const first = await createTransaction(
      request("/api/transactions", {
        method: "POST",
        headers: { cookie },
        body: formFor("electricity", input),
      }),
    );
    expect(first.status).toBe(201);

    const duplicate = await createTransaction(
      request("/api/transactions", {
        method: "POST",
        headers: { cookie },
        body: formFor("electricity", input),
      }),
    );
    expect(duplicate.status).toBe(409);
    expect((await duplicate.json()).error.code).toBe("duplicate_transaction");

    const invalidMetadata = formFor("electricity", input);
    invalidMetadata.set("metadata", JSON.stringify({ provider: "BrightGrid Power" }));
    const invalid = await createTransaction(
      request("/api/transactions", {
        method: "POST",
        headers: { cookie },
        body: invalidMetadata,
      }),
    );
    expect(invalid.status).toBe(422);
    const invalidBody = (await invalid.json()) as {
      error: { code: string; fields: Record<string, string> };
    };
    expect(invalidBody.error.code).toBe("validation_error");
    expect(
      Object.keys(invalidBody.error.fields).some((field) => field.startsWith("metadata")),
    ).toBe(true);

    const futureInput = {
      ...inputFor("mobile", "2003"),
      date: "2999-01-01",
    };
    const future = await createTransaction(
      request("/api/transactions", {
        method: "POST",
        headers: { cookie },
        body: formFor("mobile", futureInput),
      }),
    );
    expect(future.status).toBe(422);

    const mismatchedFile = new File(["not a pdf"], "fake.pdf", { type: "image/png" });
    const mismatched = await createTransaction(
      request("/api/transactions", {
        method: "POST",
        headers: { cookie },
        body: formFor("mobile", inputFor("mobile", "2004"), mismatchedFile),
      }),
    );
    expect(mismatched.status).toBe(422);
    expect((await mismatched.json()).error.code).toBe("invalid_attachment");
  });

  it("returns insufficient data first, then completes an end-to-end assessment", async () => {
    const { cookie } = await loginAs(CLEAN_ACCOUNT);
    const insufficient = await generateAssessment(
      request("/api/assessment/generate", {
        method: "POST",
        headers: { cookie, "content-type": "application/json" },
        body: JSON.stringify({ lookback_months: 6 }),
      }),
    );
    expect(insufficient.status).toBe(200);
    const insufficientBody = (await insufficient.json()) as {
      status: string;
      score: number | null;
      disclaimer: string;
      requirements: Array<{ met: boolean }>;
    };
    expect(insufficientBody.status).toBe("insufficient_data");
    expect(insufficientBody.score).toBeNull();
    expect(insufficientBody.disclaimer).toBe(DEMO_DISCLAIMER);
    expect(insufficientBody.requirements.some((requirement) => !requirement.met)).toBe(true);

    for (const [index, category] of (["rent", "electricity", "mobile"] as const).entries()) {
      const { response } = await submitPayment(
        cookie,
        category,
        `300${index}`,
        category === "rent" ? pdfFile() : undefined,
      );
      expect(response.status).toBe(201);
    }

    const summaryResponse = await getSummary(
      request("/api/transactions/summary", { headers: { cookie } }),
    );
    const summary = (await summaryResponse.json()) as {
      totals: { transactions: number; categoriesUsed: number; attachments: number };
      assessment: { ready: boolean; requirements: Array<{ met: boolean }> };
    };
    expect(summary.totals).toMatchObject({
      transactions: 3,
      categoriesUsed: 3,
      attachments: 1,
    });
    expect(summary.assessment.ready).toBe(true);
    expect(summary.assessment.requirements.every((requirement) => requirement.met)).toBe(true);

    const completed = await generateAssessment(
      request("/api/assessment/generate", {
        method: "POST",
        headers: { cookie, "content-type": "application/json" },
        body: JSON.stringify({ lookback_months: 6 }),
      }),
    );
    expect(completed.status).toBe(200);
    const assessment = (await completed.json()) as {
      status: string;
      score: number;
      maxScore: number;
      band: string;
      explanationFactors: Array<{ points: number; maxPoints: number }>;
      categoryContributions: Array<{ category: string; count: number }>;
      engine: { provisional: boolean; owner: string };
      disclaimer: string;
    };
    expect(assessment.status).toBe("completed");
    expect(assessment.score).toBeGreaterThanOrEqual(0);
    expect(assessment.score).toBeLessThanOrEqual(assessment.maxScore);
    expect(assessment.band).not.toBe("Unavailable");
    expect(assessment.explanationFactors).toHaveLength(7);
    expect(assessment.categoryContributions).toHaveLength(3);
    expect(assessment.engine.provisional).toBe(true);
    expect(assessment.engine.owner).toContain("Devansh");
    expect(assessment.disclaimer).toBe(DEMO_DISCLAIMER);
  });

  it("returns a structured 503 when the assessment engine fails", async () => {
    const { cookie } = await loginAs(CLEAN_ACCOUNT);
    const failingEngine: AssessmentEngine = {
      name: "Failing test engine",
      version: "0.0.0",
      owner: "Test",
      provisional: true,
      note: "Test-only failing engine.",
      generate() {
        throw new Error("intentional engine failure");
      },
    };

    registerAssessmentEngine(failingEngine);
    try {
      const response = await generateAssessment(
        request("/api/assessment/generate", {
          method: "POST",
          headers: { cookie, "content-type": "application/json" },
          body: JSON.stringify({ lookback_months: 6 }),
        }),
      );
      expect(response.status).toBe(503);
      expect((await response.json()).error.code).toBe("assessment_engine_unavailable");
    } finally {
      resetAssessmentEngine();
    }
  });
});
