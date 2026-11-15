import {
  CATEGORY_DEFINITIONS,
  DEMO_DISCLAIMER,
  MIN_CATEGORIES_FOR_ASSESSMENT,
  MIN_TRANSACTIONS_FOR_ASSESSMENT,
  PAYMENT_CATEGORIES,
} from "@/models/domain";
import type {
  AssessmentFactorDto,
  AssessmentRequirementDto,
  AssessmentResponseDto,
  DataCoverageDto,
  FactorStatus,
} from "@/models/api";
import type { AssessmentEngine, AssessmentInput, AssessmentTransaction } from "./types";

const FACTOR_LIMITS = {
  consistency: 25,
  categoryBreadth: 15,
  paymentVolume: 15,
  recency: 15,
  documentation: 10,
  platformDiversity: 10,
  tenure: 10,
} as const;

const VOLUME_TARGET_CENTS = 7_500_000;
const RECENCY_HORIZON_DAYS = 180;
const TENURE_TARGET_DAYS = 180;
const VOLUME_COUNT_TARGET = 6;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function round(value: number): number {
  return Math.round(value);
}

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function daysBetween(start: string, end: string): number {
  const startDate = new Date(`${start}T00:00:00.000Z`).getTime();
  const endDate = new Date(`${end}T00:00:00.000Z`).getTime();
  if (Number.isNaN(startDate) || Number.isNaN(endDate)) return 0;
  return Math.max(0, Math.floor((endDate - startDate) / 86_400_000));
}

function statusFor(ratio: number): FactorStatus {
  if (ratio >= 0.75) return "strong";
  if (ratio >= 0.4) return "moderate";
  return "needs_data";
}

function buildFactor(
  id: string,
  label: string,
  ratio: number,
  maxPoints: number,
  detail: string,
): AssessmentFactorDto {
  const bounded = clamp01(ratio);
  return {
    id,
    label,
    points: round(bounded * maxPoints),
    maxPoints,
    status: statusFor(bounded),
    detail,
  };
}

function buildRequirements(transactions: AssessmentTransaction[]): AssessmentRequirementDto[] {
  const categories = new Set(transactions.map((transaction) => transaction.category));
  return [
    {
      id: "transactions",
      label: `At least ${MIN_TRANSACTIONS_FOR_ASSESSMENT} payments`,
      met: transactions.length >= MIN_TRANSACTIONS_FOR_ASSESSMENT,
      detail: `${transactions.length} of ${MIN_TRANSACTIONS_FOR_ASSESSMENT} minimum payments recorded`,
    },
    {
      id: "categories",
      label: `At least ${MIN_CATEGORIES_FOR_ASSESSMENT} payment categories`,
      met: categories.size >= MIN_CATEGORIES_FOR_ASSESSMENT,
      detail: `${categories.size} of ${MIN_CATEGORIES_FOR_ASSESSMENT} minimum categories covered`,
    },
  ];
}

function buildCoverage(
  transactions: AssessmentTransaction[],
  lookbackMonths: number,
): DataCoverageDto {
  const monthsCovered = new Set(
    transactions.map((transaction) => transaction.transactionDate.slice(0, 7)),
  ).size;
  const categories = new Set(transactions.map((transaction) => transaction.category)).size;
  const platforms = new Set(transactions.map((transaction) => transaction.platform)).size;
  const withAttachments = transactions.filter((transaction) => transaction.hasAttachment).length;

  const components = [
    {
      id: "volume",
      label: "Payment volume",
      percentage: round(clamp01(transactions.length / VOLUME_COUNT_TARGET) * 100),
      weight: 0.3,
    },
    {
      id: "categories",
      label: "Category breadth",
      percentage: round(clamp01(categories / 3) * 100),
      weight: 0.25,
    },
    {
      id: "history",
      label: "Month coverage",
      percentage: round(clamp01(monthsCovered / lookbackMonths) * 100),
      weight: 0.25,
    },
    {
      id: "documents",
      label: "Synthetic document coverage",
      percentage:
        transactions.length > 0 ? round((withAttachments / transactions.length) * 100) : 0,
      weight: 0.1,
    },
    {
      id: "platforms",
      label: "Platform diversity",
      percentage: round(clamp01(platforms / 3) * 100),
      weight: 0.1,
    },
  ];

  const percentage = round(
    components.reduce((total, component) => total + component.percentage * component.weight, 0),
  );

  const level =
    percentage >= 75
      ? "Strong"
      : percentage >= 50
        ? "Moderate"
        : percentage >= 25
          ? "Limited"
          : "Minimal";

  return { percentage, level, components };
}

function buildCategoryContributions(transactions: AssessmentTransaction[]) {
  const totalAmount = transactions.reduce(
    (total, transaction) => total + transaction.amountCents,
    0,
  );

  return PAYMENT_CATEGORIES.map((category) => {
    const entries = transactions.filter((transaction) => transaction.category === category);
    const amountCents = entries.reduce((total, transaction) => total + transaction.amountCents, 0);
    return {
      category,
      count: entries.length,
      amount: amountCents / 100,
      sharePercentage:
        totalAmount > 0 ? Math.round((amountCents / totalAmount) * 1000) / 10 : 0,
    };
  });
}

function bandFor(score: number): { band: string; interpretation: string } {
  if (score >= 85) {
    return {
      band: "Strong",
      interpretation:
        "The synthetic history shows broad category coverage, recent activity, and repeated evidence. This indicates strong illustrative payment credibility within the prototype dataset.",
    };
  }
  if (score >= 70) {
    return {
      band: "Good",
      interpretation:
        "The synthetic history shows a credible pattern of payment activity with some areas that could benefit from additional evidence.",
    };
  }
  if (score >= 55) {
    return {
      band: "Fair",
      interpretation:
        "The prototype engine found a moderate signal. More consistent history or additional synthetic documentation would strengthen the illustrative result.",
    };
  }
  if (score >= 40) {
    return {
      band: "Developing",
      interpretation:
        "The available synthetic payment history is thin or irregular. The illustrative result should be treated as an early signal rather than a settled view.",
    };
  }
  return {
    band: "Limited",
    interpretation:
      "The prototype engine found limited evidence in this synthetic dataset. Additional categories, recency, or documentation would improve data coverage.",
  };
}

function engineMeta() {
  return {
    name: "FinCred reference baseline engine",
    version: "0.1.0-reference",
    owner: "Devansh (agreed methodology pending integration)",
    provisional: true,
    note:
      "This provisional reference ruleset implements the assessment contract supplied with the prototype. It must be replaced with Devansh's approved scoring engine before any non-demo use.",
  };
}

function missingCategoryGaps(transactions: AssessmentTransaction[]): string[] {
  const present = new Set(transactions.map((transaction) => transaction.category));
  return PAYMENT_CATEGORIES.filter((category) => !present.has(category)).map(
    (category) =>
      `No synthetic ${CATEGORY_DEFINITIONS[category].label.toLowerCase()} payments fall within this assessment window.`,
  );
}

export class ReferenceAssessmentEngine implements AssessmentEngine {
  readonly name = "FinCred reference baseline engine";
  readonly version = "0.1.0-reference";
  readonly owner = "Devansh (agreed methodology pending integration)";
  readonly provisional = true;
  readonly note =
    "Provisional reference ruleset. Replace with Devansh's approved engine through registerAssessmentEngine().";

  generate(input: AssessmentInput): AssessmentResponseDto {
    const { transactions, lookbackMonths, asOf } = input;
    const requirements = buildRequirements(transactions);
    const dataCoverage = buildCoverage(transactions, lookbackMonths);
    const categoryContributions = buildCategoryContributions(transactions);
    const hasEnoughData = requirements.every((requirement) => requirement.met);

    if (!hasEnoughData) {
      const dataGaps = [
        ...requirements
          .filter((requirement) => !requirement.met)
          .map((requirement) => `${requirement.label}: ${requirement.detail}.`),
        ...missingCategoryGaps(transactions),
      ];

      return {
        status: "insufficient_data",
        score: null,
        maxScore: 100,
        band: "Unavailable",
        interpretation:
          "There is not yet enough synthetic payment history to calculate an illustrative score.",
        summary: `Add more payments to this demo account. The reference engine needs at least ${MIN_TRANSACTIONS_FOR_ASSESSMENT} payments across ${MIN_CATEGORIES_FOR_ASSESSMENT} categories before it can produce a score.`,
        explanationFactors: [],
        positiveIndicators: [],
        dataGaps,
        processedTransactions: transactions.length,
        dataCoverage,
        categoryContributions,
        requirements,
        assessmentTimestamp: asOf.toISOString(),
        lookbackMonths,
        engine: engineMeta(),
        disclaimer: DEMO_DISCLAIMER,
      };
    }

    const dates = transactions.map((transaction) => transaction.transactionDate).sort();
    const earliest = dates[0];
    const latest = dates[dates.length - 1];
    const monthsCovered = new Set(dates.map((date) => date.slice(0, 7))).size;
    const categoryCount = new Set(transactions.map((transaction) => transaction.category)).size;
    const platformCount = new Set(transactions.map((transaction) => transaction.platform)).size;
    const attachmentCount = transactions.filter((transaction) => transaction.hasAttachment).length;
    const totalCents = transactions.reduce(
      (total, transaction) => total + transaction.amountCents,
      0,
    );
    const spanDays = daysBetween(earliest, latest);
    const daysSinceLatest = daysBetween(latest, asOf.toISOString().slice(0, 10));

    const factors: AssessmentFactorDto[] = [
      buildFactor(
        "consistency",
        "Payment consistency",
        monthsCovered / lookbackMonths,
        FACTOR_LIMITS.consistency,
        `${monthsCovered} active payment month(s) were observed across the ${lookbackMonths}-month window.`,
      ),
      buildFactor(
        "categoryBreadth",
        "Category breadth",
        categoryCount / PAYMENT_CATEGORIES.length,
        FACTOR_LIMITS.categoryBreadth,
        `${categoryCount} of ${PAYMENT_CATEGORIES.length} supported payment categories are represented.`,
      ),
      buildFactor(
        "paymentVolume",
        "Payment volume",
        totalCents / VOLUME_TARGET_CENTS,
        FACTOR_LIMITS.paymentVolume,
        `${formatCurrency(totalCents)} of synthetic payments were recorded in the window.`,
      ),
      buildFactor(
        "recency",
        "Payment recency",
        1 - daysSinceLatest / RECENCY_HORIZON_DAYS,
        FACTOR_LIMITS.recency,
        `The latest synthetic payment was ${daysSinceLatest} day(s) before this assessment.`,
      ),
      buildFactor(
        "documentation",
        "Supporting documentation",
        attachmentCount / transactions.length,
        FACTOR_LIMITS.documentation,
        `${attachmentCount} of ${transactions.length} payments include a synthetic attachment.`,
      ),
      buildFactor(
        "platformDiversity",
        "Platform diversity",
        platformCount / 3,
        FACTOR_LIMITS.platformDiversity,
        `${platformCount} payment platform(s) are represented in the synthetic history.`,
      ),
      buildFactor(
        "tenure",
        "History span",
        spanDays / TENURE_TARGET_DAYS,
        FACTOR_LIMITS.tenure,
        `The synthetic payment history spans ${spanDays} day(s).`,
      ),
    ];

    const score = Math.min(
      100,
      factors.reduce((total, factor) => total + factor.points, 0),
    );
    const { band, interpretation } = bandFor(score);

    const strongFactors = factors.filter((factor) => factor.status === "strong");
    const weakFactors = factors.filter((factor) => factor.status === "needs_data");
    const positiveIndicators = strongFactors.map(
      (factor) => `${factor.label}: ${factor.detail}`,
    );
    const dataGaps = [
      ...weakFactors.map((factor) => `${factor.label}: ${factor.detail}`),
      ...missingCategoryGaps(transactions),
    ];

    const categoryNames = Array.from(
      new Set(
        transactions.map((transaction) => CATEGORY_DEFINITIONS[transaction.category].label),
      ),
    ).join(", ");

    const summaryParts = [
      `Across ${transactions.length} synthetic payments in ${categoryCount} categories (${categoryNames}), the reference engine observed ${monthsCovered} active month(s) within the ${lookbackMonths}-month illustrative window.`,
    ];
    if (strongFactors.length > 0) {
      summaryParts.push(
        `The strongest signals were ${strongFactors.map((factor) => factor.label.toLowerCase()).join(" and ")}.`,
      );
    }
    if (weakFactors.length > 0) {
      summaryParts.push(
        `The engine would benefit from more evidence for ${weakFactors.map((factor) => factor.label.toLowerCase()).join(" and ")}.`,
      );
    }

    return {
      status: "completed",
      score,
      maxScore: 100,
      band,
      interpretation,
      summary: summaryParts.join(" "),
      explanationFactors: factors,
      positiveIndicators,
      dataGaps,
      processedTransactions: transactions.length,
      dataCoverage,
      categoryContributions,
      requirements,
      assessmentTimestamp: asOf.toISOString(),
      lookbackMonths,
      engine: engineMeta(),
      disclaimer: DEMO_DISCLAIMER,
    };
  }
}
