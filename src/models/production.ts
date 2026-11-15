export type ConsentStatus = "granted" | "withdrawn" | "expired";

export interface ConsentRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  lenderId: string | null;
  lenderEmail: string | null;
  lenderName: string | null;
  purpose: string;
  description: string;
  scope: string[];
  status: ConsentStatus;
  grantedAt: string;
  expiresAt: string | null;
  withdrawnAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LenderNoteRecord {
  id: string;
  lenderId: string;
  lenderName: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  organizationId: string | null;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportRecord {
  id: string;
  userId: string;
  applicantName: string;
  applicantEmail: string;
  requestedBy: string;
  requestedByName: string;
  reportType: string;
  status: "completed" | "insufficient_data";
  score: number | null;
  band: string;
  reportVersion: string;
  assessment: unknown;
  contentSha256: string;
  createdAt: string;
  expiresAt: string | null;
}

export interface SyntheticJobRecord {
  id: string;
  userId: string;
  requestedBy: string;
  status: "queued" | "running" | "completed" | "failed";
  categories: string[];
  recordCount: number;
  lookbackMonths: number;
  result: Record<string, unknown>;
  errorMessage: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface AuditLogRecord {
  id: string;
  actorId: string | null;
  actorRole: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  requestId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface LenderOrganizationRecord {
  id: string;
  name: string;
  slug: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface LenderApplicantRecord {
  id: string;
  email: string;
  fullName: string;
  status: string;
  consentExpiry: string | null;
  latestScore: number | null;
  latestReportAt: string | null;
  transactionCount: number;
}

export interface AdminUserSummary {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  createdAt: string;
  transactionCount: number;
  reportCount: number;
  consentCount: number;
}

export interface AdminPaymentSummary {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  category: string;
  amount: number;
  transactionDate: string;
  platform: string;
  description: string;
  createdAt: string;
}

export interface AdminOverview {
  users: number;
  consumers: number;
  lenders: number;
  admins: number;
  disabledUsers: number;
  transactions: number;
  reports: number;
  activeConsents: number;
  auditEvents: number;
}

export interface Pagination {
  limit: number;
  offset: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}
