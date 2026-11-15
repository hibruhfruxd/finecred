import { listTransactions } from "@/backend/db/repository";
import { getAssessmentEngine } from "./index";
import type { AssessmentTransaction } from "./types";

function monthCutoff(asOf: Date, lookbackMonths: number): string {
  const cutoff = new Date(
    Date.UTC(asOf.getUTCFullYear(), asOf.getUTCMonth() - lookbackMonths, asOf.getUTCDate()),
  );
  return cutoff.toISOString().slice(0, 10);
}

export async function runAssessmentForUser(userId: string, lookbackMonths: number) {
  const asOf = new Date();
  const cutoff = monthCutoff(asOf, lookbackMonths);
  const today = asOf.toISOString().slice(0, 10);

  const transactions: AssessmentTransaction[] = (await listTransactions(userId, { limit: 200 }))
    .filter(
      (transaction) =>
        transaction.transactionDate >= cutoff && transaction.transactionDate <= today,
    )
    .map((transaction) => ({
      id: transaction.id,
      category: transaction.category,
      amountCents: transaction.amountCents,
      transactionDate: transaction.transactionDate,
      platform: transaction.platform,
      description: transaction.description,
      metadata: transaction.metadata,
      hasAttachment: transaction.attachment !== null,
    }));

  return getAssessmentEngine().generate({
    userId,
    transactions,
    lookbackMonths,
    asOf,
  });
}
