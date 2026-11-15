import { randomUUID } from "node:crypto";
import { getDb } from "./index";
import type { SyntheticJobRecord } from "@/models/production";
import { buildTransactionFingerprint } from "@/backend/transactions/fingerprint";
import { isPaymentCategory, type PaymentCategory } from "@/models/domain";

type Row = Record<string, unknown>;

const AMOUNTS: Record<PaymentCategory, number> = {
  rent: 2_500_000,
  electricity: 195_000,
  mobile: 69_900,
};

const PLATFORMS: Record<PaymentCategory, string> = {
  rent: "Bank Transfer",
  electricity: "UPI",
  mobile: "Mobile Wallet",
};

function parseJson(value: unknown): Record<string, unknown> {
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

function parseCategories(value: unknown): string[] {
  if (typeof value !== "string") return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((entry): entry is string => typeof entry === "string")
      : [];
  } catch {
    return [];
  }
}

function toJob(row: Row): SyntheticJobRecord {
  return {
    id: String(row.id ?? ""),
    userId: String(row.user_id ?? ""),
    requestedBy: String(row.requested_by ?? ""),
    status: String(row.status ?? "") as SyntheticJobRecord["status"],
    categories: parseCategories(row.categories_json),
    recordCount: Number(row.record_count ?? 0),
    lookbackMonths: Number(row.lookback_months ?? 0),
    result: parseJson(row.result_json),
    errorMessage: typeof row.error_message === "string" ? row.error_message : null,
    createdAt: String(row.created_at ?? ""),
    completedAt: typeof row.completed_at === "string" ? row.completed_at : null,
  };
}

function generatedDate(monthsAgo: number, day: number): string {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo, Math.min(day, 28)),
  )
    .toISOString()
    .slice(0, 10);
}

function metadataFor(
  category: PaymentCategory,
  jobId: string,
  index: number,
  period: string,
): Record<string, string> {
  if (category === "rent") {
    return {
      landlord_reference: `SYNTH-RENT-${jobId.slice(0, 8)}-${index}`,
      rental_period: period,
      payment_frequency: "Monthly",
    };
  }
  if (category === "electricity") {
    return {
      provider: "BrightGrid Power",
      billing_period: period,
      consumer_reference: `SYNTH-ELEC-${jobId.slice(0, 8)}-${index}`,
    };
  }
  return {
    operator: "Northline Telecom",
    billing_type: "Prepaid Recharge",
    billing_period: period,
  };
}

export async function generateSyntheticData(input: {
  userId: string;
  requestedBy: string;
  categories: PaymentCategory[];
  recordCount: number;
  lookbackMonths: number;
}): Promise<SyntheticJobRecord> {
  const db = await getDb();
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const categories = input.categories.filter(isPaymentCategory);
  if (categories.length === 0) {
    throw new Error("At least one valid category is required.");
  }

  await db.execute(
    `INSERT INTO synthetic_jobs (
       id, user_id, requested_by, status, categories_json, record_count,
       lookback_months, result_json, created_at
     ) VALUES (?, ?, ?, 'running', ?, ?, ?, '{}', ?)`,
    [
      id,
      input.userId,
      input.requestedBy,
      JSON.stringify(categories),
      input.recordCount,
      input.lookbackMonths,
      createdAt,
    ],
  );

  try {
    const transactionIds = await db.transaction(async (tx) => {
      const ids: string[] = [];
      for (let index = 0; index < input.recordCount; index += 1) {
        const category = categories[index % categories.length];
        const monthsAgo = index % Math.max(input.lookbackMonths, 1);
        const day = category === "rent" ? 5 : category === "electricity" ? 12 : 20;
        const transactionDate = generatedDate(monthsAgo, day);
        const period = transactionDate.slice(0, 7);
        const metadata = metadataFor(category, id, index, period);
        const description = `Synthetic generated ${category} record ${index + 1} from job ${id.slice(0, 8)}.`;
        const amountCents = AMOUNTS[category];
        const platform = PLATFORMS[category];
        const fingerprint = buildTransactionFingerprint({
          category,
          amountCents,
          transactionDate,
          platform,
          description,
          metadata,
        });
        const transactionId = randomUUID();
        ids.push(transactionId);

        await tx.execute(
          `INSERT INTO transactions (
             id, user_id, category, amount_cents, transaction_date, platform, description,
             metadata_json, fingerprint, created_at
           ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            transactionId,
            input.userId,
            category,
            amountCents,
            transactionDate,
            platform,
            description,
            JSON.stringify(metadata),
            fingerprint,
            new Date().toISOString(),
          ],
        );
      }
      return ids;
    });

    const completedAt = new Date().toISOString();
    await db.execute(
      "UPDATE synthetic_jobs SET status = 'completed', result_json = ?, completed_at = ? WHERE id = ?",
      [
        JSON.stringify({
          transactionIds,
          generatedCount: transactionIds.length,
          generator: "synthetic-generator-v1",
          disclaimer:
            "Generated records are fictional and exist only for prototype demonstrations.",
        }),
        completedAt,
        id,
      ],
    );
  } catch (error) {
    await db.execute(
      "UPDATE synthetic_jobs SET status = 'failed', error_message = ?, completed_at = ? WHERE id = ?",
      [
        error instanceof Error ? error.message.slice(0, 500) : "Synthetic generation failed.",
        new Date().toISOString(),
        id,
      ],
    );
    throw error;
  }

  const job = await findSyntheticJob(id);
  if (!job) throw new Error("Synthetic job completed but retrieval failed.");
  return job;
}

export async function findSyntheticJob(id: string): Promise<SyntheticJobRecord | null> {
  const db = await getDb();
  const row = await db.queryOne<Row>("SELECT * FROM synthetic_jobs WHERE id = ?", [id]);
  return row ? toJob(row) : null;
}

export async function listSyntheticJobs(userId?: string): Promise<SyntheticJobRecord[]> {
  const db = await getDb();
  const rows = userId
    ? await db.query<Row>(
        "SELECT * FROM synthetic_jobs WHERE user_id = ? ORDER BY created_at DESC LIMIT 100",
        [userId],
      )
    : await db.query<Row>(
        "SELECT * FROM synthetic_jobs ORDER BY created_at DESC LIMIT 100",
      );
  return rows.map(toJob);
}
