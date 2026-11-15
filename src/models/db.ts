import type { PaymentCategory } from "@/models/domain";

export interface UserRecord {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  authVersion: number;
  createdAt: string;
}

export interface UserRow extends UserRecord {
  passwordHash: string;
}

export interface AttachmentRecord {
  filename: string;
  storedName: string;
  mimeType: string;
  size: number;
}

export interface TransactionRecord {
  id: string;
  userId: string;
  category: PaymentCategory;
  amountCents: number;
  transactionDate: string;
  platform: string;
  description: string;
  metadata: Record<string, string>;
  attachment: AttachmentRecord | null;
  createdAt: string;
}

export interface CategorySummary {
  category: PaymentCategory;
  count: number;
  amountCents: number;
}

export interface TransactionSummary {
  totalTransactions: number;
  totalAmountCents: number;
  categoriesUsed: number;
  attachments: number;
  categoryBreakdown: CategorySummary[];
  recentTransactions: TransactionRecord[];
  latestTransactionDate: string | null;
}

export interface InsertTransactionInput {
  userId: string;
  category: PaymentCategory;
  amountCents: number;
  transactionDate: string;
  platform: string;
  description: string;
  metadata: Record<string, string>;
  attachment: AttachmentRecord | null;
  fingerprint: string;
}
