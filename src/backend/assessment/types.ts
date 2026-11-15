import type { PaymentCategory } from "@/models/domain";
import type { AssessmentResponseDto } from "@/models/api";

export interface AssessmentTransaction {
  id: string;
  category: PaymentCategory;
  amountCents: number;
  transactionDate: string;
  platform: string;
  description: string;
  metadata: Record<string, string>;
  hasAttachment: boolean;
}

export interface AssessmentInput {
  userId: string;
  transactions: AssessmentTransaction[];
  lookbackMonths: number;
  asOf: Date;
}

export interface AssessmentEngine {
  readonly name: string;
  readonly version: string;
  readonly owner: string;
  readonly provisional: boolean;
  readonly note: string;
  generate(input: AssessmentInput): AssessmentResponseDto;
}
