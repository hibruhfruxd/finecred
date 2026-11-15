import type { TransactionRecord } from "@/models/db";
import type { TransactionDto } from "@/models/api";

export function serializeTransaction(transaction: TransactionRecord): TransactionDto {
  return {
    id: transaction.id,
    category: transaction.category,
    amount: transaction.amountCents / 100,
    transactionDate: transaction.transactionDate,
    platform: transaction.platform,
    description: transaction.description,
    metadata: transaction.metadata,
    attachment: transaction.attachment
      ? {
          filename: transaction.attachment.filename,
          mimeType: transaction.attachment.mimeType,
          size: transaction.attachment.size,
          downloadUrl: `/api/transactions/${transaction.id}/attachment`,
        }
      : null,
    createdAt: transaction.createdAt,
  };
}
