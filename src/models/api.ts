import type { PaymentCategory } from "@/models/domain";

export interface PublicUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

export interface AttachmentDto {
  filename: string;
  mimeType: string;
  size: number;
  downloadUrl: string;
}

export interface TransactionDto {
  id: string;
  category: PaymentCategory;
  amount: number;
  transactionDate: string;
  platform: string;
  description: string;
  metadata: Record<string, string>;
  attachment: AttachmentDto | null;
  createdAt: string;
}

export interface CategorySummaryDto {
  category: PaymentCategory;
  count: number;
  amount: number;
}

export interface AssessmentRequirementDto {
  id: string;
  label: string;
  met: boolean;
  detail: string;
}

export interface TransactionSummaryDto {
  totals: {
    transactions: number;
    totalAmount: number;
    categoriesUsed: number;
    attachments: number;
    latestTransactionDate: string | null;
  };
  categories: CategorySummaryDto[];
  recentTransactions: TransactionDto[];
  assessment: {
    ready: boolean;
    requirements: AssessmentRequirementDto[];
  };
}

export interface LoginResponseDto {
  user: PublicUser;
}

export interface DemoAccountDto {
  email: string;
  password: string;
  fullName: string;
  role: string;
  label: string;
  description: string;
  sampleData: boolean;
}

export type FactorStatus = "strong" | "moderate" | "needs_data";

export interface AssessmentFactorDto {
  id: string;
  label: string;
  points: number;
  maxPoints: number;
  status: FactorStatus;
  detail: string;
}

export interface DataCoverageComponentDto {
  id: string;
  label: string;
  percentage: number;
  weight: number;
}

export interface DataCoverageDto {
  percentage: number;
  level: string;
  components: DataCoverageComponentDto[];
}

export interface CategoryContributionDto {
  category: PaymentCategory;
  count: number;
  amount: number;
  sharePercentage: number;
}

export interface AssessmentEngineMetaDto {
  name: string;
  version: string;
  owner: string;
  provisional: boolean;
  note: string;
}

export type AssessmentStatus = "completed" | "insufficient_data";

export interface AssessmentResponseDto {
  status: AssessmentStatus;
  score: number | null;
  maxScore: number;
  band: string;
  interpretation: string;
  summary: string;
  explanationFactors: AssessmentFactorDto[];
  positiveIndicators: string[];
  dataGaps: string[];
  processedTransactions: number;
  dataCoverage: DataCoverageDto;
  categoryContributions: CategoryContributionDto[];
  requirements: AssessmentRequirementDto[];
  assessmentTimestamp: string;
  lookbackMonths: number;
  engine: AssessmentEngineMetaDto;
  disclaimer: string;
}

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}
