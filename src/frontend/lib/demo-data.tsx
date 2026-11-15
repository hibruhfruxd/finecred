"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export const ASSESSMENT_DATE = "2026-11-11";
export const DEMO_MODEL = "FC-DEMO-1.0";
export const SYNTHETIC_BANNER =
  "SYNTHETIC DATA ONLY  •  EXPERIMENTAL ASSESSMENT  •  NOT A CREDIT BUREAU SCORE";

export const CATEGORY_LABELS = {
  rent: "Rent",
  utilities: "Utilities",
  internet: "Internet",
  insurance: "Insurance",
  education: "Education",
  subscriptions: "Subscriptions",
} as const;

export type DemoCategory = keyof typeof CATEGORY_LABELS;

export type PaymentStatus = "paid_on_time" | "paid_late" | "pending" | "upcoming";

export interface DemoPayment {
  id: string;
  title: string;
  category: DemoCategory;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  billingPeriod: string;
  recurring: boolean;
  method: string;
  notes?: string;
}

export function derivePaymentStatus(payment: DemoPayment): PaymentStatus {
  if (payment.paidDate) {
    return payment.paidDate <= payment.dueDate ? "paid_on_time" : "paid_late";
  }
  return payment.dueDate > ASSESSMENT_DATE ? "upcoming" : "pending";
}

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid_on_time: "Paid on time",
  paid_late: "Paid late",
  pending: "Pending",
  upcoming: "Upcoming",
};

function isoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function shortMonth(year: number, month: number): string {
  return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(year, month, 1)),
  );
}

const MONTHS = [
  [2025, 11],
  [2026, 0],
  [2026, 1],
  [2026, 2],
  [2026, 3],
  [2026, 4],
  [2026, 5],
  [2026, 6],
  [2026, 7],
  [2026, 8],
  [2026, 9],
  [2026, 10],
] as const;

const PAYMENT_TEMPLATES: {
  category: DemoCategory;
  title: string;
  amount: number;
  day: number;
  method: string;
}[] = [
  { category: "rent", title: "Monthly rent", amount: 18_000, day: 3, method: "Bank transfer" },
  { category: "utilities", title: "Electricity bill", amount: 1_850, day: 5, method: "UPI" },
  { category: "internet", title: "Internet bill", amount: 899, day: 7, method: "Auto-debit" },
  { category: "insurance", title: "Health insurance", amount: 2_451, day: 9, method: "Bank transfer" },
  { category: "education", title: "Online course", amount: 1_200, day: 10, method: "UPI" },
  { category: "subscriptions", title: "App subscriptions", amount: 450, day: 11, method: "Card" },
];

function buildPayments(): DemoPayment[] {
  const payments: DemoPayment[] = [];
  let index = 0;

  for (const [year, month] of MONTHS) {
    for (const template of PAYMENT_TEMPLATES) {
      const dueDate = isoDate(year, month, template.day);
      const isUpcoming = index >= 70;
      const isLate = index === 23 || index === 47;
      const paidDate = isUpcoming
        ? null
        : isLate
          ? isoDate(year, month, template.day + (index === 23 ? 3 : 2))
          : isoDate(year, month, Math.max(1, template.day - 1));

      payments.push({
        id: `pay-${String(index + 1).padStart(3, "0")}`,
        title: `${shortMonth(year, month).split(" ")[0]} ${template.title.toLowerCase()}`,
        category: template.category,
        amount: template.amount,
        dueDate,
        paidDate,
        billingPeriod: shortMonth(year, month),
        recurring: true,
        method: template.method,
        notes: "Synthetic demo record. No real financial information.",
      });
      index += 1;
    }
  }

  return payments;
}

export const DEMO_PAYMENTS = buildPayments();

export const DEMO_NOTIFICATIONS = [
  {
    id: "note-1",
    title: "November credibility assessment is ready",
    message: "Your illustrative score is 782, up 12 points from the previous assessment.",
    category: "Assessment",
    createdAt: "2026-11-11T09:30:00.000Z",
    read: false,
  },
  {
    id: "note-2",
    title: "Upcoming internet bill",
    message: "Your synthetic internet bill of INR 899 is due on 18 November 2026.",
    category: "Payment reminder",
    createdAt: "2026-11-10T08:00:00.000Z",
    read: false,
  },
  {
    id: "note-3",
    title: "Lender sharing consent active",
    message: "Demo Lender A can view your synthetic assessment until 31 January 2027.",
    category: "Consent",
    createdAt: "2026-11-08T13:15:00.000Z",
    read: false,
  },
  {
    id: "note-4",
    title: "Monthly report generated",
    message: "Your October payment history report is available to download.",
    category: "Report",
    createdAt: "2026-11-02T10:20:00.000Z",
    read: true,
  },
  {
    id: "note-5",
    title: "Coverage milestone reached",
    message: "You now have 12 months of observed synthetic payment history.",
    category: "Coverage",
    createdAt: "2026-10-30T07:45:00.000Z",
    read: true,
  },
  {
    id: "note-6",
    title: "Payment recorded",
    message: "Water utility payment of INR 650 was recorded as paid on time.",
    category: "Payment",
    createdAt: "2026-10-15T16:10:00.000Z",
    read: true,
  },
];

export const DEMO_CONSENTS = [
  {
    id: "consent-1",
    purpose: "Assessment processing",
    description: "Generate illustrative assessments from your synthetic payment records.",
    status: "Granted",
    grantedAt: "2025-12-01T09:00:00.000Z",
    expiresAt: "Until withdrawn",
  },
  {
    id: "consent-2",
    purpose: "Lender sharing — Demo Lender A",
    description: "Share your latest assessment and payment coverage with Demo Lender A.",
    status: "Granted",
    grantedAt: "2026-11-08T13:15:00.000Z",
    expiresAt: "31 Jan 2027",
  },
  {
    id: "consent-3",
    purpose: "Product analytics",
    description: "Allow aggregate, de-identified demo usage analytics.",
    status: "Withdrawn",
    grantedAt: "2026-01-14T11:00:00.000Z",
    expiresAt: "Withdrawn 04 Mar 2026",
  },
];

export const DEMO_PROFILE = {
  fullName: "Aarav Mehta",
  displayName: "Demo Consumer 001",
  email: "consumer@fincred.demo",
  phone: "+91 90000 00001",
  city: "Bengaluru",
  state: "Karnataka",
  country: "India",
  dateOfBirth: "1994-04-18",
  occupation: "Product designer",
  purpose: "Personal financial awareness",
  preferredCurrency: "INR",
  joinedAt: "01 Dec 2025",
};

export const DEMO_INSIGHTS = [
  {
    id: "insight-1",
    title: "Punctuality is your strongest signal",
    body: "68 of 72 recorded payments were settled on or before their due date. This is the largest positive contributor to your illustrative score.",
    tone: "positive",
    metric: "94% on time",
  },
  {
    id: "insight-2",
    title: "Two payments were recorded after the due date",
    body: "Your February and August electricity records were paid 3 and 2 days late. These are the only late settlements in the observed period.",
    tone: "warning",
    metric: "2 late records",
  },
  {
    id: "insight-3",
    title: "Rent is your largest recurring obligation",
    body: "Monthly rent of INR 18,000 accounts for 72% of your recorded monthly obligations. Payment continuity for rent is complete.",
    tone: "neutral",
    metric: "INR 18,000 / month",
  },
  {
    id: "insight-4",
    title: "Data coverage is complete",
    body: "You have 12 observed months, 72 records and four active categories. Coverage contributes 100 out of 100 to the illustrative assessment.",
    tone: "positive",
    metric: "100 / 100 coverage",
  },
  {
    id: "insight-5",
    title: "Subscription payments are less regular",
    body: "Subscription due dates moved in three months. Recording a consistent billing day may improve the regularity indicator.",
    tone: "info",
    metric: "3 date changes",
  },
];

export const DEMO_SCORE_HISTORY = [
  { month: "Jun", score: 758, previous: null },
  { month: "Jul", score: 767, previous: 758 },
  { month: "Aug", score: 763, previous: 767 },
  { month: "Sep", score: 774, previous: 763 },
  { month: "Oct", score: 770, previous: 774 },
  { month: "Nov", score: 782, previous: 770 },
];

export const DEMO_INDICATORS = [
  { name: "Payment consistency", value: 92, weight: "12%" },
  { name: "Payment punctuality", value: 94, weight: "18%" },
  { name: "Payment delays", value: 90, weight: "12%" },
  { name: "Payment regularity", value: 88, weight: "8%" },
  { name: "Monthly obligation patterns", value: 83, weight: "6%" },
  { name: "Expense stability", value: 86, weight: "6%" },
  { name: "Payment continuity", value: 92, weight: "8%" },
  { name: "Obligation management", value: 95, weight: "12%" },
  { name: "Historical payment stability", value: 89, weight: "8%" },
  { name: "Data coverage", value: 100, weight: "10%" },
];

export const DEMO_ANALYTICS = [
  { month: "Dec", onTime: 6, late: 0, pending: 0, amount: 24_850 },
  { month: "Jan", onTime: 6, late: 0, pending: 0, amount: 24_850 },
  { month: "Feb", onTime: 5, late: 1, pending: 0, amount: 24_850 },
  { month: "Mar", onTime: 6, late: 0, pending: 0, amount: 24_850 },
  { month: "Apr", onTime: 6, late: 0, pending: 0, amount: 24_850 },
  { month: "May", onTime: 6, late: 0, pending: 0, amount: 24_850 },
  { month: "Jun", onTime: 6, late: 0, pending: 0, amount: 24_850 },
  { month: "Jul", onTime: 6, late: 0, pending: 0, amount: 24_850 },
  { month: "Aug", onTime: 5, late: 1, pending: 0, amount: 24_850 },
  { month: "Sep", onTime: 6, late: 0, pending: 0, amount: 24_850 },
  { month: "Oct", onTime: 6, late: 0, pending: 0, amount: 24_850 },
  { month: "Nov", onTime: 4, late: 0, pending: 2, amount: 24_850 },
];

export const DEMO_CATEGORY_DATA = [
  { name: "Rent", value: 47_000, color: "#2563EB" },
  { name: "Utilities", value: 21_000, color: "#0EA5E9" },
  { name: "Insurance", value: 14_000, color: "#8B5CF6" },
  { name: "Internet", value: 10_000, color: "#16A34A" },
  { name: "Education", value: 5_000, color: "#F59E0B" },
  { name: "Subscriptions", value: 3_000, color: "#64748B" },
];

export const DEMO_REPORTS = [
  {
    id: "rep-1",
    title: "Credibility summary",
    description: "Latest illustrative score, indicator breakdown, coverage, and synthetic disclaimer.",
    period: "November 2026",
    type: "PDF",
    updated: "11 Nov 2026",
  },
  {
    id: "rep-2",
    title: "Payment history",
    description: "Complete list of synthetic payment records with due, paid, and derived status values.",
    period: "Last 12 months",
    type: "CSV",
    updated: "11 Nov 2026",
  },
  {
    id: "rep-3",
    title: "Data coverage report",
    description: "Observed months, record counts, categories, and missing-record disclosure.",
    period: "Last 12 months",
    type: "PDF",
    updated: "11 Nov 2026",
  },
  {
    id: "rep-4",
    title: "Consent activity",
    description: "Persona-specific processing and sharing consent history for the demo account.",
    period: "All time",
    type: "CSV",
    updated: "08 Nov 2026",
  },
];

const APPLICANT_NAMES = [
  "Demo Consumer 001",
  "Demo Consumer 014",
  "Demo Consumer 027",
  "Demo Consumer 004",
  "Demo Consumer 008",
  "Demo Consumer 011",
  "Demo Consumer 019",
  "Demo Consumer 022",
  "Demo Consumer 031",
  "Demo Consumer 006",
  "Demo Consumer 009",
  "Demo Consumer 013",
  "Demo Consumer 017",
  "Demo Consumer 021",
  "Demo Consumer 024",
  "Demo Consumer 029",
  "Demo Consumer 033",
  "Demo Consumer 036",
  "Demo Consumer 002",
  "Demo Consumer 005",
  "Demo Consumer 007",
  "Demo Consumer 010",
  "Demo Consumer 012",
  "Demo Consumer 015",
  "Demo Consumer 016",
  "Demo Consumer 018",
  "Demo Consumer 020",
  "Demo Consumer 023",
  "Demo Consumer 025",
  "Demo Consumer 026",
  "Demo Consumer 028",
  "Demo Consumer 030",
  "Demo Consumer 032",
  "Demo Consumer 034",
  "Demo Consumer 035",
  "Demo Consumer 037",
];

const APPLICANT_SCORES = [
  782, 701, null, 748, 812, 735, 690, 758, 824, 663, 779, 715, 742, 801, 688, 726, 754, 793, 711,
  768, 706, 785, 731, 812, 675, 744, 763, 722, 796, 708, 751, 734, 789, 697, 764, 727,
];

export const DEMO_APPLICANTS = APPLICANT_NAMES.map((name, index) => {
  const score = APPLICANT_SCORES[index] ?? null;
  const months = index === 2 ? 2 : index % 9 === 0 ? 6 : 12;
  return {
    id: `app-${String(index + 1).padStart(3, "0")}`,
    name,
    email: `demo.consumer.${String(index + 1).padStart(3, "0")}@fincred.demo`,
    score,
    coverageMonths: months,
    punctuality: score === null ? null : Math.min(99, Math.max(70, score - 8 + (index % 11))),
    categories: months >= 6 ? 4 : 2,
    records: months >= 6 ? 72 : 11,
    assessedAt: index === 2 ? "No assessment" : "11 Nov 2026",
    status: score === null ? "Insufficient data" : index === 5 ? "Expiring soon" : "Authorized",
    consentExpiry: index === 5 ? "18 Nov 2026" : "31 Jan 2027",
    amount: 150_000 + index * 25_000,
    purpose: ["Working capital", "Home improvement", "Education", "Debt consolidation"][index % 4],
    income: 65_000 + (index % 8) * 10_000,
    employment: ["Salaried", "Self-employed", "Business owner"][index % 3],
    location: ["Bengaluru", "Mumbai", "Pune", "Delhi", "Hyderabad"][index % 5],
    phone: `+91 90000 0${String(index + 10).padStart(4, "0")}`,
  };
});

export const LENDER_MONTHLY_APPLICANTS = [
  { month: "Jun", applicants: 22, assessments: 18 },
  { month: "Jul", applicants: 25, assessments: 21 },
  { month: "Aug", applicants: 27, assessments: 24 },
  { month: "Sep", applicants: 31, assessments: 27 },
  { month: "Oct", applicants: 33, assessments: 30 },
  { month: "Nov", applicants: 36, assessments: 33 },
];

export const LENDER_SCORE_DISTRIBUTION = [
  { band: "Under 600", count: 2 },
  { band: "600–699", count: 7 },
  { band: "700–749", count: 11 },
  { band: "750–799", count: 12 },
  { band: "800–900", count: 4 },
];

export const LENDER_ASSESSMENTS = DEMO_APPLICANTS.slice(0, 12).map((applicant, index) => ({
  id: `asmt-${String(index + 1).padStart(3, "0")}`,
  applicantId: applicant.id,
  applicant: applicant.name,
  score: applicant.score,
  model: DEMO_MODEL,
  assessedAt: applicant.assessedAt,
  coverage: `${applicant.coverageMonths} months`,
  status: applicant.score === null ? "Insufficient data" : "Complete",
}));

export const ADMIN_USERS = [
  {
    id: "user-demo-consumer",
    name: "Aarav Mehta",
    email: "consumer@fincred.demo",
    role: "Consumer",
    status: "Active",
    location: "Bengaluru",
    joined: "01 Dec 2025",
    lastActive: "11 Nov 2026",
  },
  {
    id: "user-demo-lender",
    name: "Priya Nair",
    email: "lender@fincred.demo",
    role: "Lender",
    status: "Active",
    location: "Mumbai",
    joined: "12 Jan 2026",
    lastActive: "11 Nov 2026",
  },
  {
    id: "user-demo-admin",
    name: "Rohan Kapoor",
    email: "admin@fincred.demo",
    role: "Administrator",
    status: "Active",
    location: "Delhi",
    joined: "05 Dec 2025",
    lastActive: "11 Nov 2026",
  },
  ...Array.from({ length: 97 }, (_, index) => ({
    id: `user-${String(index + 4).padStart(3, "0")}`,
    name: `Demo Consumer ${String(index + 2).padStart(3, "0")}`,
    email: `demo.consumer.${String(index + 2).padStart(3, "0")}@fincred.demo`,
    role: "Consumer",
    status: index === 19 ? "Disabled" : "Active",
    location: ["Bengaluru", "Mumbai", "Pune", "Delhi", "Hyderabad", "Chennai"][index % 6],
    joined: `${String((index % 28) + 1).padStart(2, "0")} ${["Jan", "Feb", "Mar", "Apr", "May", "Jun"][index % 6]} 2026`,
    lastActive: `${String((index % 10) + 1).padStart(2, "0")} Nov 2026`,
  })),
];

export const ADMIN_LENDERS = [
  {
    id: "org-1",
    name: "Demo Lender A",
    code: "DEMO-A",
    contact: "Priya Nair",
    email: "lender@fincred.demo",
    members: 4,
    applicants: 36,
    status: "Active",
    created: "12 Jan 2026",
  },
  {
    id: "org-2",
    name: "Demo Lender B",
    code: "DEMO-B",
    contact: "Karan Shah",
    email: "ops@demolenderb.demo",
    members: 3,
    applicants: 24,
    status: "Active",
    created: "03 Feb 2026",
  },
  {
    id: "org-3",
    name: "Demo Lender C",
    code: "DEMO-C",
    contact: "Meera Iyer",
    email: "risk@demolenderc.demo",
    members: 2,
    applicants: 18,
    status: "Paused",
    created: "19 Mar 2026",
  },
];

export const ADMIN_AUDIT_LOGS = [
  { id: "aud-1", time: "14:31:08", actor: "Demo Admin", action: "SYNTHETIC_GENERATION", scope: "batch: demo-202611", ip: "127.0.0.1", requestId: "req_8f2a1" },
  { id: "aud-2", time: "14:28:42", actor: "Demo Lender A", action: "ASSESSMENT_READ", scope: "authorized applicant", ip: "127.0.0.1", requestId: "req_8f29c" },
  { id: "aud-3", time: "14:24:15", actor: "Demo Consumer 001", action: "PAYMENT_UPDATED", scope: "own record", ip: "127.0.0.1", requestId: "req_8f27e" },
  { id: "aud-4", time: "14:12:03", actor: "Demo Consumer 014", action: "CONSENT_GRANTED", scope: "Demo Lender A", ip: "127.0.0.1", requestId: "req_8f21a" },
  { id: "aud-5", time: "13:58:19", actor: "Demo Admin", action: "SCORING_VERSION_DRAFTED", scope: "FC-DEMO-1.1", ip: "127.0.0.1", requestId: "req_8f1bd" },
  { id: "aud-6", time: "13:44:50", actor: "Demo Lender A", action: "REPORT_EXPORTED", scope: "portfolio-nov-2026", ip: "127.0.0.1", requestId: "req_8f17f" },
  { id: "aud-7", time: "13:31:22", actor: "Demo Consumer 027", action: "ASSESSMENT_REQUESTED", scope: "own assessment", ip: "127.0.0.1", requestId: "req_8f142" },
  { id: "aud-8", time: "13:18:06", actor: "Demo Admin", action: "USER_DISABLED", scope: "demo.consumer.020", ip: "127.0.0.1", requestId: "req_8f0ce" },
  { id: "aud-9", time: "12:59:37", actor: "Demo Consumer 008", action: "CONSENT_WITHDRAWN", scope: "Demo Lender B", ip: "127.0.0.1", requestId: "req_8f064" },
  { id: "aud-10", time: "12:47:11", actor: "Demo Lender B", action: "APPLICANT_VIEWED", scope: "authorized applicant", ip: "127.0.0.1", requestId: "req_8f01b" },
  { id: "aud-11", time: "12:32:48", actor: "System", action: "SESSION_EXPIRED", scope: "scheduled cleanup", ip: "internal", requestId: "req_8efbe" },
  { id: "aud-12", time: "12:15:02", actor: "Demo Admin", action: "SYNTHETIC_PREVIEW", scope: "seed: 202611", ip: "127.0.0.1", requestId: "req_8ef5a" },
];

export const ADMIN_CONSENTS = DEMO_APPLICANTS.slice(0, 14).map((applicant, index) => ({
  id: `consent-admin-${index + 1}`,
  consumer: applicant.name,
  purpose: index % 3 === 0 ? "Lender sharing" : "Assessment processing",
  organization: index % 3 === 0 ? ADMIN_LENDERS[index % 2].name : "—",
  status: index === 9 ? "Withdrawn" : "Active",
  granted: `${String((index % 28) + 1).padStart(2, "0")} Oct 2026`,
  expires: index % 3 === 0 ? "31 Jan 2027" : "Until withdrawn",
}));

export const ADMIN_RECENT_PAYMENTS = DEMO_PAYMENTS.slice(52, 72)
  .reverse()
  .map((payment) => ({
    id: payment.id,
    consumer: "Demo Consumer 001",
    title: payment.title,
    category: CATEGORY_LABELS[payment.category],
    amount: payment.amount,
    dueDate: payment.dueDate,
    status: PAYMENT_STATUS_LABELS[derivePaymentStatus(payment)],
  }));

export const ADMIN_REPORTS = [
  { id: "ar-1", name: "Platform usage summary", period: "November 2026", format: "PDF", generated: "11 Nov 2026", scope: "All synthetic tenants" },
  { id: "ar-2", name: "Synthetic data inventory", period: "November 2026", format: "CSV", generated: "11 Nov 2026", scope: "Batch demo-202611" },
  { id: "ar-3", name: "Scoring version history", period: "All time", format: "PDF", generated: "09 Nov 2026", scope: "FC-DEMO-1.0" },
  { id: "ar-4", name: "Consent register", period: "Last 12 months", format: "CSV", generated: "08 Nov 2026", scope: "All consumers" },
  { id: "ar-5", name: "Audit event digest", period: "Last 30 days", format: "PDF", generated: "07 Nov 2026", scope: "Administrative events" },
];

interface DemoState {
  payments: DemoPayment[];
  notifications: typeof DEMO_NOTIFICATIONS;
  consents: typeof DEMO_CONSENTS;
  profile: typeof DEMO_PROFILE;
}

interface DemoDataContextValue extends DemoState {
  addPayment: (payment: Omit<DemoPayment, "id">) => DemoPayment;
  updatePayment: (id: string, payment: Omit<DemoPayment, "id">) => void;
  deletePayment: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setConsentStatus: (id: string, status: "Granted" | "Withdrawn") => void;
  updateProfile: (profile: Partial<typeof DEMO_PROFILE>) => void;
  resetDemoData: () => void;
}

const STORAGE_KEY = "finance-credibility-demo-v1";

const INITIAL_STATE: DemoState = {
  payments: DEMO_PAYMENTS,
  notifications: DEMO_NOTIFICATIONS,
  consents: DEMO_CONSENTS,
  profile: DEMO_PROFILE,
};

const DemoDataContext = createContext<DemoDataContextValue | null>(null);

export function DemoDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(INITIAL_STATE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<DemoState>;
        setState((current) => ({
          payments: parsed.payments ?? current.payments,
          notifications: parsed.notifications ?? current.notifications,
          consents: parsed.consents ?? current.consents,
          profile: parsed.profile ?? current.profile,
        }));
      }
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  const addPayment = useCallback((payment: Omit<DemoPayment, "id">) => {
    const created: DemoPayment = {
      ...payment,
      id: `pay-user-${Date.now()}`,
    };
    setState((current) => ({ ...current, payments: [created, ...current.payments] }));
    return created;
  }, []);

  const updatePayment = useCallback((id: string, payment: Omit<DemoPayment, "id">) => {
    setState((current) => ({
      ...current,
      payments: current.payments.map((item) =>
        item.id === id ? { ...payment, id } : item,
      ),
    }));
  }, []);

  const deletePayment = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      payments: current.payments.filter((item) => item.id !== id),
    }));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      ),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setState((current) => ({
      ...current,
      notifications: current.notifications.map((item) => ({ ...item, read: true })),
    }));
  }, []);

  const setConsentStatus = useCallback((id: string, status: "Granted" | "Withdrawn") => {
    setState((current) => ({
      ...current,
      consents: current.consents.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              expiresAt: status === "Withdrawn" ? "Withdrawn just now" : item.expiresAt,
            }
          : item,
      ),
    }));
  }, []);

  const updateProfile = useCallback((profile: Partial<typeof DEMO_PROFILE>) => {
    setState((current) => ({ ...current, profile: { ...current.profile, ...profile } }));
  }, []);

  const resetDemoData = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setState(INITIAL_STATE);
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      addPayment,
      updatePayment,
      deletePayment,
      markNotificationRead,
      markAllNotificationsRead,
      setConsentStatus,
      updateProfile,
      resetDemoData,
    }),
    [
      state,
      addPayment,
      updatePayment,
      deletePayment,
      markNotificationRead,
      markAllNotificationsRead,
      setConsentStatus,
      updateProfile,
      resetDemoData,
    ],
  );

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
}

export function useDemoData(): DemoDataContextValue {
  const context = useContext(DemoDataContext);
  if (!context) throw new Error("useDemoData must be used within DemoDataProvider");
  return context;
}

export function formatInr(amount: number, decimals = 0): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(amount);
}

export function formatDemoDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatShortDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}

export function downloadTextFile(filename: string, content: string, mime = "text/csv") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function reportCsvReport(title: string): string {
  const rows = [
    ["Finance Credibility — synthetic demo report"],
    ["Report", title],
    ["Identity label", "Demo Consumer 001"],
    ["Assessment date", "11 Nov 2026"],
    ["Score", "782 / 900"],
    ["Coverage", "12 months, 72 records, 4 categories"],
    ["On-time rate", "94%"],
    ["Model", DEMO_MODEL],
    [SYNTHETIC_BANNER],
  ];
  return rows.map((row) => row.map((value) => `"${value}"`).join(",")).join("\n");
}
