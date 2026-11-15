import { createHash } from "node:crypto";
import type { PaymentCategory } from "@/models/domain";

interface FingerprintInput {
  category: PaymentCategory;
  amountCents: number;
  transactionDate: string;
  platform: string;
  description: string;
  metadata: Record<string, string>;
}

export function buildTransactionFingerprint(input: FingerprintInput): string {
  const sortedMetadata = Object.keys(input.metadata)
    .sort()
    .map((key) => `${key}=${input.metadata[key].trim().toLowerCase()}`)
    .join("|");

  const canonical = [
    input.category,
    String(input.amountCents),
    input.transactionDate,
    input.platform.trim().toLowerCase(),
    input.description.trim().toLowerCase(),
    sortedMetadata,
  ].join("::");

  return createHash("sha256").update(canonical).digest("hex");
}
