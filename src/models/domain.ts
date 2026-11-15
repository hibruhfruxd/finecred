export const PAYMENT_CATEGORIES = ["rent", "electricity", "mobile"] as const;

export type PaymentCategory = (typeof PAYMENT_CATEGORIES)[number];

export interface CategoryDefinition {
  id: PaymentCategory;
  label: string;
  shortLabel: string;
  description: string;
  accent: string;
}

export const CATEGORY_DEFINITIONS: Record<PaymentCategory, CategoryDefinition> = {
  rent: {
    id: "rent",
    label: "Rent",
    shortLabel: "Rent",
    description:
      "Record synthetic monthly housing payments to demonstrate recurring payment behaviour.",
    accent: "rent",
  },
  electricity: {
    id: "electricity",
    label: "Electricity",
    shortLabel: "Electricity",
    description:
      "Add illustrative utility bill payments from a fictional electricity provider.",
    accent: "electricity",
  },
  mobile: {
    id: "mobile",
    label: "Mobile Bills",
    shortLabel: "Mobile",
    description:
      "Capture synthetic telecom recharges or postpaid bills to show service payment history.",
    accent: "mobile",
  },
};

export const PAYMENT_PLATFORMS = [
  "UPI",
  "Bank Transfer",
  "Debit Card",
  "Credit Card",
  "Net Banking",
  "Mobile Wallet",
  "Auto-Debit",
  "Cash",
] as const;

export type PaymentPlatform = (typeof PAYMENT_PLATFORMS)[number];

export const RENT_FREQUENCIES = ["Monthly", "Quarterly", "Annual", "One-time"] as const;
export const MOBILE_BILLING_TYPES = ["Prepaid Recharge", "Postpaid Bill"] as const;

export type CategoryFieldType = "text" | "select";

export interface CategoryFieldDefinition {
  name: string;
  label: string;
  placeholder: string;
  hint: string;
  type: CategoryFieldType;
  options?: readonly string[];
}

export const CATEGORY_FIELDS: Record<PaymentCategory, CategoryFieldDefinition[]> = {
  rent: [
    {
      name: "landlord_reference",
      label: "Landlord / property reference",
      placeholder: "e.g. LND-2041 / Palm Grove Apartments",
      hint: "Use a fictional reference only. Do not enter real tenancy details.",
      type: "text",
    },
    {
      name: "rental_period",
      label: "Rental period",
      placeholder: "e.g. March 2026",
      hint: "The synthetic period this rent payment covers.",
      type: "text",
    },
    {
      name: "payment_frequency",
      label: "Payment frequency",
      placeholder: "Select frequency",
      hint: "How often this fictional rent is paid.",
      type: "select",
      options: RENT_FREQUENCIES,
    },
  ],
  electricity: [
    {
      name: "provider",
      label: "Electricity provider",
      placeholder: "e.g. BrightGrid Power",
      hint: "Use a fictional utility provider name.",
      type: "text",
    },
    {
      name: "billing_period",
      label: "Billing period",
      placeholder: "e.g. February 2026",
      hint: "The synthetic billing cycle for this record.",
      type: "text",
    },
    {
      name: "consumer_reference",
      label: "Consumer reference",
      placeholder: "e.g. SYNT-ELEC-8821",
      hint: "A synthetic consumer number. Never use a real account number.",
      type: "text",
    },
  ],
  mobile: [
    {
      name: "operator",
      label: "Telecom operator",
      placeholder: "e.g. Northline Telecom",
      hint: "A fictional mobile operator.",
      type: "text",
    },
    {
      name: "billing_type",
      label: "Recharge / billing type",
      placeholder: "Select billing type",
      hint: "Choose the synthetic payment type.",
      type: "select",
      options: MOBILE_BILLING_TYPES,
    },
    {
      name: "billing_period",
      label: "Billing period",
      placeholder: "e.g. March 2026",
      hint: "The synthetic period this mobile payment covers.",
      type: "text",
    },
  ],
};

export const CATEGORY_METADATA_FIELDS = CATEGORY_FIELDS;

export const MAX_TRANSACTION_AMOUNT = 10_000_000;
export const MIN_TRANSACTIONS_FOR_ASSESSMENT = 3;
export const MIN_CATEGORIES_FOR_ASSESSMENT = 2;
export const DEFAULT_LOOKBACK_MONTHS = 6;

export const DEMO_DISCLAIMER =
  "This is an illustrative prototype assessment based on synthetic demo data. It is not a credit score, lending decision, or validated financial assessment.";

export function isPaymentCategory(value: unknown): value is PaymentCategory {
  return typeof value === "string" && (PAYMENT_CATEGORIES as readonly string[]).includes(value);
}

export function isPaymentPlatform(value: unknown): value is PaymentPlatform {
  return typeof value === "string" && (PAYMENT_PLATFORMS as readonly string[]).includes(value);
}
