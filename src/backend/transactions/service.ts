import { ApiError } from "@/backend/http/errors";
import type { AttachmentRecord } from "@/models/db";
import {
  DuplicateTransactionError,
  findTransactionByFingerprint,
  insertTransaction,
} from "@/backend/db/repository";
import type { TransactionInput } from "@/models/validation/transaction";
import { buildTransactionFingerprint } from "./fingerprint";

export async function createTransactionForUser(
  userId: string,
  input: TransactionInput,
  attachment: AttachmentRecord | null,
) {
  const amountCents = Math.round(input.amount * 100);
  const fingerprint = buildTransactionFingerprint({
    category: input.category,
    amountCents,
    transactionDate: input.transaction_date,
    platform: input.platform,
    description: input.description,
    metadata: input.metadata,
  });

  if (await findTransactionByFingerprint(userId, fingerprint)) {
    throw new ApiError(
      409,
      "duplicate_transaction",
      "A payment with the same category, amount, date, platform, description, and reference details already exists.",
    );
  }

  try {
    return await insertTransaction({
      userId,
      category: input.category,
      amountCents,
      transactionDate: input.transaction_date,
      platform: input.platform,
      description: input.description,
      metadata: input.metadata,
      attachment,
      fingerprint,
    });
  } catch (error) {
    if (error instanceof DuplicateTransactionError) {
      throw new ApiError(
        409,
        "duplicate_transaction",
        "A payment with the same details already exists in this demo account.",
      );
    }
    console.error("[fincred-transactions] Failed to store transaction:", error);
    throw new ApiError(
      500,
      "transaction_persistence_failed",
      "The demo transaction could not be saved. Please try again.",
    );
  }
}
