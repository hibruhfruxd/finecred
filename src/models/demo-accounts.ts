export type DemoRole = "consumer" | "lender" | "admin";

export interface DemoAccountDefinition {
  email: string;
  password: string;
  fullName: string;
  role: DemoRole;
  label: string;
  description: string;
  sampleData: boolean;
  initials: string;
}

export const DEMO_PASSWORD = "Demo@123";

export const DEMO_ACCOUNTS: readonly DemoAccountDefinition[] = [
  {
    email: "consumer@fincred.demo",
    password: DEMO_PASSWORD,
    fullName: "Aarav Mehta",
    role: "consumer",
    label: "Consumer workspace",
    description:
      "Explore a complete synthetic payment history, credibility score, analytics, insights, and reports.",
    sampleData: true,
    initials: "AM",
  },
  {
    email: "lender@fincred.demo",
    password: DEMO_PASSWORD,
    fullName: "Priya Nair",
    role: "lender",
    label: "Lender workspace",
    description:
      "Review synthetic applicants, assessment summaries, portfolio reports, and API access.",
    sampleData: false,
    initials: "PN",
  },
  {
    email: "admin@fincred.demo",
    password: DEMO_PASSWORD,
    fullName: "Rohan Kapoor",
    role: "admin",
    label: "Admin console",
    description:
      "Inspect demo users, lender organizations, scoring configuration, consents, and audit events.",
    sampleData: false,
    initials: "RK",
  },
];

export const ROLE_LABELS: Record<DemoRole, string> = {
  consumer: "Consumer",
  lender: "Lender",
  admin: "Administrator",
};

export function findDemoAccount(email: string): DemoAccountDefinition | undefined {
  return DEMO_ACCOUNTS.find((account) => account.email === email.toLowerCase());
}
