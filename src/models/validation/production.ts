import { z } from "zod";
import { DEFAULT_LOOKBACK_MONTHS, PAYMENT_CATEGORIES } from "@/models/domain";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD format.");

export const consentCreateSchema = z
  .object({
    purpose: z.string().trim().min(3, "Purpose is required.").max(140),
    description: z.string().trim().max(600).default(""),
    lender_email: z
      .union([z.string().trim().email("Enter a valid lender email."), z.literal("")])
      .optional()
      .transform((value) => value || undefined),
    scope: z
      .array(z.string().trim().min(1).max(80))
      .min(1, "Select at least one sharing scope.")
      .max(20)
      .default(["assessment"]),
    expires_at: isoDate.optional(),
  })
  .strict();

export const consentUpdateSchema = z
  .object({
    status: z.enum(["granted", "withdrawn"]),
    expires_at: isoDate.nullable().optional(),
  })
  .strict();

export const lenderNoteCreateSchema = z
  .object({
    body: z.string().trim().min(2, "Write a note first.").max(4_000),
    organization_id: z.string().trim().min(1).optional(),
  })
  .strict();

export const reportCreateSchema = z
  .object({
    lookback_months: z
      .number()
      .int()
      .min(1)
      .max(24)
      .default(DEFAULT_LOOKBACK_MONTHS),
    applicant_id: z.string().trim().min(1).optional(),
    user_id: z.string().trim().min(1).optional(),
  })
  .strict();

export const syntheticJobCreateSchema = z
  .object({
    categories: z
      .array(z.enum(PAYMENT_CATEGORIES))
      .min(1, "Select at least one category.")
      .max(PAYMENT_CATEGORIES.length)
      .default([...PAYMENT_CATEGORIES]),
    record_count: z.number().int().min(1).max(120).default(12),
    lookback_months: z.number().int().min(1).max(24).default(6),
    user_id: z.string().trim().min(1).optional(),
  })
  .strict();

export const adminUserUpdateSchema = z
  .object({
    role: z.enum(["consumer", "lender", "admin"]).optional(),
    status: z.enum(["active", "disabled"]).optional(),
  })
  .strict()
  .refine((value) => value.role !== undefined || value.status !== undefined, {
    message: "Provide a role or status to update.",
  });

export const paginationSchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().min(0).default(0),
    status: z.string().trim().max(40).optional(),
    role: z.string().trim().max(40).optional(),
    q: z.string().trim().max(120).optional(),
  })
  .passthrough();
