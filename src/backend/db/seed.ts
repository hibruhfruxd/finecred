import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { hashPassword, needsPasswordRehash } from "@/backend/auth/password";
import { DEMO_ACCOUNTS } from "@/models/demo-accounts";
import type { PaymentCategory } from "@/models/domain";
import { buildTransactionFingerprint } from "@/backend/transactions/fingerprint";
import { getUploadRoot } from "@/backend/config/paths";
import type { DatabaseAdapter } from "./adapter";

const demoPasswordHashes = new Map<string, string>();

function demoPasswordHash(email: string, password: string): string {
  const cached = demoPasswordHashes.get(email);
  if (cached && !needsPasswordRehash(cached)) return cached;
  const hash = hashPassword(password);
  demoPasswordHashes.set(email, hash);
  return hash;
}

interface SeedTransaction {
  category: PaymentCategory;
  amountCents: number;
  monthsAgo: number;
  day: number;
  platform: string;
  description: string;
  metadata: Record<string, string>;
  attachment?: { filename: string; storedName: string };
}

const SAMPLE_PDF = Buffer.from(
  "%PDF-1.4\n% FinCred synthetic demo document. Not a real financial record.\n1 0 obj << /Type /Catalog >> endobj\ntrailer << /Root 1 0 R >>\n%%EOF\n",
  "utf8",
);

function dateMonthsAgo(monthsAgo: number, day: number): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, Math.min(day, 28)),
  )
    .toISOString()
    .slice(0, 10);
}

function sampleTransactions(): SeedTransaction[] {
  return [
    {
      category: "rent",
      amountCents: 2_500_000,
      monthsAgo: 5,
      day: 5,
      platform: "Bank Transfer",
      description: "Synthetic monthly rent to Palm Grove Apartments.",
      metadata: {
        landlord_reference: "LND-2041 / Palm Grove Apartments",
        rental_period: "Five months ago",
        payment_frequency: "Monthly",
      },
      attachment: { filename: "synthetic-rent-sample.pdf", storedName: "sample-rent.pdf" },
    },
    {
      category: "rent",
      amountCents: 2_500_000,
      monthsAgo: 4,
      day: 5,
      platform: "Bank Transfer",
      description: "Synthetic monthly rent to Palm Grove Apartments.",
      metadata: {
        landlord_reference: "LND-2041 / Palm Grove Apartments",
        rental_period: "Four months ago",
        payment_frequency: "Monthly",
      },
    },
    {
      category: "rent",
      amountCents: 2_500_000,
      monthsAgo: 3,
      day: 5,
      platform: "Auto-Debit",
      description: "Synthetic monthly rent to Palm Grove Apartments.",
      metadata: {
        landlord_reference: "LND-2041 / Palm Grove Apartments",
        rental_period: "Three months ago",
        payment_frequency: "Monthly",
      },
    },
    {
      category: "rent",
      amountCents: 2_500_000,
      monthsAgo: 2,
      day: 5,
      platform: "Auto-Debit",
      description: "Synthetic monthly rent to Palm Grove Apartments.",
      metadata: {
        landlord_reference: "LND-2041 / Palm Grove Apartments",
        rental_period: "Two months ago",
        payment_frequency: "Monthly",
      },
    },
    {
      category: "electricity",
      amountCents: 185_000,
      monthsAgo: 4,
      day: 12,
      platform: "UPI",
      description: "Synthetic electricity bill from BrightGrid Power.",
      metadata: {
        provider: "BrightGrid Power",
        billing_period: "Four months ago",
        consumer_reference: "SYNT-ELEC-8821",
      },
      attachment: {
        filename: "synthetic-electricity-sample.pdf",
        storedName: "sample-electricity.pdf",
      },
    },
    {
      category: "electricity",
      amountCents: 210_000,
      monthsAgo: 2,
      day: 12,
      platform: "UPI",
      description: "Synthetic electricity bill from BrightGrid Power.",
      metadata: {
        provider: "BrightGrid Power",
        billing_period: "Two months ago",
        consumer_reference: "SYNT-ELEC-8821",
      },
    },
    {
      category: "electricity",
      amountCents: 194_000,
      monthsAgo: 1,
      day: 12,
      platform: "Debit Card",
      description: "Synthetic electricity bill from BrightGrid Power.",
      metadata: {
        provider: "BrightGrid Power",
        billing_period: "One month ago",
        consumer_reference: "SYNT-ELEC-8821",
      },
    },
    {
      category: "mobile",
      amountCents: 59_900,
      monthsAgo: 3,
      day: 20,
      platform: "Mobile Wallet",
      description: "Synthetic prepaid mobile recharge.",
      metadata: {
        operator: "Northline Telecom",
        billing_type: "Prepaid Recharge",
        billing_period: "Three months ago",
      },
    },
    {
      category: "mobile",
      amountCents: 79_900,
      monthsAgo: 1,
      day: 20,
      platform: "Mobile Wallet",
      description: "Synthetic prepaid mobile recharge.",
      metadata: {
        operator: "Northline Telecom",
        billing_type: "Prepaid Recharge",
        billing_period: "One month ago",
      },
    },
  ];
}

function ensureSampleAttachments(userId: string): void {
  const directory = path.join(getUploadRoot(), userId);
  mkdirSync(directory, { recursive: true });
  writeFileSync(path.join(directory, "sample-rent.pdf"), SAMPLE_PDF, { flag: "w" });
  writeFileSync(path.join(directory, "sample-electricity.pdf"), SAMPLE_PDF, { flag: "w" });
}

async function seedSampleTransactions(db: DatabaseAdapter): Promise<void> {
  if (process.env.FINCRED_SEED_SAMPLE === "false") return;

  const reviewer = DEMO_ACCOUNTS.find((account) => account.sampleData);
  if (!reviewer) return;

  const user = await db.queryOne<{ id: string }>(
    "SELECT id FROM users WHERE email = ?",
    [reviewer.email],
  );
  if (!user) return;

  const existing = await db.queryOne<{ count: number | bigint | string }>(
    "SELECT COUNT(*) AS count FROM transactions WHERE user_id = ?",
    [user.id],
  );
  if (Number(existing?.count ?? 0) > 0) return;

  ensureSampleAttachments(user.id);

  const samples = sampleTransactions();
  for (const sample of samples) {
    const transactionDate = dateMonthsAgo(sample.monthsAgo, sample.day);
    const fingerprint = buildTransactionFingerprint({
      category: sample.category,
      amountCents: sample.amountCents,
      transactionDate,
      platform: sample.platform,
      description: sample.description,
      metadata: sample.metadata,
    });

    await db.execute(
      `INSERT INTO transactions (
        id, user_id, category, amount_cents, transaction_date, platform, description,
        metadata_json, attachment_filename, attachment_stored_name, attachment_mime,
        attachment_size, fingerprint, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        user.id,
        sample.category,
        sample.amountCents,
        transactionDate,
        sample.platform,
        sample.description,
        JSON.stringify(sample.metadata),
        sample.attachment?.filename ?? null,
        sample.attachment?.storedName ?? null,
        sample.attachment ? "application/pdf" : null,
        sample.attachment ? SAMPLE_PDF.byteLength : null,
        fingerprint,
        new Date().toISOString(),
      ],
    );
  }
}

async function seedLenderOrganization(db: DatabaseAdapter): Promise<void> {
  const createdAt = new Date().toISOString();
  const existing = await db.queryOne<{ id: string }>(
    "SELECT id FROM lender_organizations WHERE slug = ?",
    ["demo-lender-a"],
  );
  const organizationId = existing?.id ?? randomUUID();

  if (!existing) {
    await db.execute(
      `INSERT INTO lender_organizations (id, name, slug, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [organizationId, "Demo Lender A", "demo-lender-a", "active", createdAt, createdAt],
    );
  }

  const lender = DEMO_ACCOUNTS.find((account) => account.role === "lender");
  if (!lender) return;
  const user = await db.queryOne<{ id: string }>(
    "SELECT id FROM users WHERE email = ?",
    [lender.email],
  );
  if (!user) return;

  const membership = await db.queryOne<{ user_id: string }>(
    `SELECT user_id FROM organization_members
     WHERE organization_id = ? AND user_id = ?`,
    [organizationId, user.id],
  );
  if (!membership) {
    await db.execute(
      `INSERT INTO organization_members (organization_id, user_id, role, created_at)
       VALUES (?, ?, ?, ?)`,
      [organizationId, user.id, "owner", createdAt],
    );
  }
}

async function seedDemoConsents(db: DatabaseAdapter): Promise<void> {
  const consumer = DEMO_ACCOUNTS.find((account) => account.role === "consumer");
  const lender = DEMO_ACCOUNTS.find((account) => account.role === "lender");
  if (!consumer || !lender) return;

  const consumerUser = await db.queryOne<{ id: string }>(
    "SELECT id FROM users WHERE email = ?",
    [consumer.email],
  );
  const lenderUser = await db.queryOne<{ id: string }>(
    "SELECT id FROM users WHERE email = ?",
    [lender.email],
  );
  if (!consumerUser || !lenderUser) return;

  const now = new Date();
  const createdAt = now.toISOString();
  const expiresAt = new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString();

  const definitions = [
    {
      purpose: "Synthetic data processing",
      description: "Allow this demo workspace to calculate illustrative assessments.",
      lenderId: null as string | null,
      scope: ["payment_records", "assessments"],
    },
    {
      purpose: "Assessment sharing with Demo Lender A",
      description:
        "Allow Demo Lender A to view the illustrative assessment and payment summary.",
      lenderId: lenderUser.id,
      scope: ["assessment", "payment_summary", "report"],
    },
  ];

  for (const definition of definitions) {
    const existing = definition.lenderId
      ? await db.queryOne<{ id: string }>(
          "SELECT id FROM consents WHERE user_id = ? AND lender_id = ? AND purpose = ?",
          [consumerUser.id, definition.lenderId, definition.purpose],
        )
      : await db.queryOne<{ id: string }>(
          "SELECT id FROM consents WHERE user_id = ? AND lender_id IS NULL AND purpose = ?",
          [consumerUser.id, definition.purpose],
        );
    if (existing) continue;

    await db.execute(
      `INSERT INTO consents (
         id, user_id, lender_id, purpose, description, scope_json, status,
         granted_at, expires_at, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        consumerUser.id,
        definition.lenderId,
        definition.purpose,
        definition.description,
        JSON.stringify(definition.scope),
        "granted",
        createdAt,
        expiresAt,
        createdAt,
        createdAt,
      ],
    );
  }
}

export async function ensureSeedData(db: DatabaseAdapter): Promise<void> {
  const createdAt = new Date().toISOString();

  for (const account of DEMO_ACCOUNTS) {
    const existing = await db.queryOne<{ id: string; password_hash: string }>(
      "SELECT id, password_hash FROM users WHERE email = ?",
      [account.email],
    );

    if (existing) {
      const passwordHash = needsPasswordRehash(existing.password_hash)
        ? demoPasswordHash(account.email, account.password)
        : existing.password_hash;
      await db.execute(
        "UPDATE users SET full_name = ?, password_hash = ?, role = ? WHERE email = ?",
        [account.fullName, passwordHash, account.role, account.email],
      );
      continue;
    }

    await db.execute(
      `INSERT INTO users (id, email, full_name, password_hash, role, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        account.email,
        account.fullName,
        demoPasswordHash(account.email, account.password),
        account.role,
        createdAt,
      ],
    );
  }

  await seedLenderOrganization(db);
  await seedDemoConsents(db);
  await seedSampleTransactions(db);
}
