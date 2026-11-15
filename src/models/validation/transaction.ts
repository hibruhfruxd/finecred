import { z } from "zod";
import {
  MAX_TRANSACTION_AMOUNT,
  MOBILE_BILLING_TYPES,
  PAYMENT_CATEGORIES,
  PAYMENT_PLATFORMS,
  RENT_FREQUENCIES,
} from "@/models/domain";
import { transactionDateError } from "./date";

const trimmedText = (label: string, min: number, max: number) =>
  z
    .string({ message: `${label} is required.` })
    .trim()
    .min(min, `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be ${max} characters or fewer.`);

const dateField = z
  .string({ message: "Transaction date is required." })
  .trim()
  .min(1, "Transaction date is required.")
  .superRefine((value, context) => {
    const error = transactionDateError(value);
    if (error) {
      context.addIssue({ code: "custom", message: error });
    }
  });

const amountField = z.coerce
  .number({ message: "Enter a valid payment amount." })
  .finite("Enter a valid payment amount.")
  .positive("Payment amount must be greater than zero.")
  .max(MAX_TRANSACTION_AMOUNT, `Payment amount cannot exceed ${MAX_TRANSACTION_AMOUNT}.`)
  .refine(
    (value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6,
    "Use no more than two decimal places for the amount.",
  );

const commonShape = {
  amount: amountField,
  transaction_date: dateField,
  platform: z.enum(PAYMENT_PLATFORMS, {
    message: "Select a supported payment platform.",
  }),
  description: trimmedText("Transaction description", 3, 300),
};

const rentSchema = z
  .object({
    category: z.literal("rent"),
    ...commonShape,
    metadata: z
      .object({
        landlord_reference: trimmedText("Landlord / property reference", 2, 120),
        rental_period: trimmedText("Rental period", 2, 60),
        payment_frequency: z.enum(RENT_FREQUENCIES, {
          message: "Select a valid rent payment frequency.",
        }),
      })
      .strict(),
  })
  .strict();

const electricitySchema = z
  .object({
    category: z.literal("electricity"),
    ...commonShape,
    metadata: z
      .object({
        provider: trimmedText("Electricity provider", 2, 100),
        billing_period: trimmedText("Billing period", 2, 60),
        consumer_reference: trimmedText("Consumer reference", 4, 60),
      })
      .strict(),
  })
  .strict();

const mobileSchema = z
  .object({
    category: z.literal("mobile"),
    ...commonShape,
    metadata: z
      .object({
        operator: trimmedText("Telecom operator", 2, 100),
        billing_type: z.enum(MOBILE_BILLING_TYPES, {
          message: "Select a valid mobile billing type.",
        }),
        billing_period: trimmedText("Billing period", 2, 60),
      })
      .strict(),
  })
  .strict();

export const transactionInputSchema = z.discriminatedUnion("category", [
  rentSchema,
  electricitySchema,
  mobileSchema,
]);

export type TransactionInput = z.infer<typeof transactionInputSchema>;

export const transactionCategoryFilterSchema = z.enum(PAYMENT_CATEGORIES);

export const transactionListQuerySchema = z
  .object({
    category: z.enum(PAYMENT_CATEGORIES).optional(),
    limit: z.coerce.number().int().min(1).max(200).optional(),
  })
  .strict();
