import { z } from "zod";
import { DEFAULT_LOOKBACK_MONTHS } from "@/models/domain";

export const assessmentRequestSchema = z
  .object({
    lookback_months: z
      .number({ message: "Lookback period must be a number of months." })
      .int("Lookback period must be a whole number of months.")
      .min(1, "Lookback period must be at least 1 month.")
      .max(24, "Lookback period cannot exceed 24 months.")
      .default(DEFAULT_LOOKBACK_MONTHS),
  })
  .strict();

export type AssessmentRequestInput = z.infer<typeof assessmentRequestSchema>;
