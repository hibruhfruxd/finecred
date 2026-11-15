import {
  CATEGORY_DEFINITIONS,
  MIN_CATEGORIES_FOR_ASSESSMENT,
  MIN_TRANSACTIONS_FOR_ASSESSMENT,
  PAYMENT_CATEGORIES,
} from "@/models/domain";
import { getTransactionSummary } from "@/backend/db/repository";
import type { TransactionSummaryDto } from "@/models/api";
import { serializeTransaction } from "./serializers";

export async function getSummaryForUser(userId: string): Promise<TransactionSummaryDto> {
  const summary = await getTransactionSummary(userId);
  const categoryMap = new Map(
    summary.categoryBreakdown.map((category) => [category.category, category]),
  );

  const categories = PAYMENT_CATEGORIES.map((category) => {
    const entry = categoryMap.get(category);
    return {
      category,
      count: entry?.count ?? 0,
      amount: (entry?.amountCents ?? 0) / 100,
    };
  });

  const requirements = [
    {
      id: "transactions",
      label: `At least ${MIN_TRANSACTIONS_FOR_ASSESSMENT} payments`,
      met: summary.totalTransactions >= MIN_TRANSACTIONS_FOR_ASSESSMENT,
      detail: `${summary.totalTransactions} of ${MIN_TRANSACTIONS_FOR_ASSESSMENT} minimum payments recorded`,
    },
    {
      id: "categories",
      label: `At least ${MIN_CATEGORIES_FOR_ASSESSMENT} payment categories`,
      met: summary.categoriesUsed >= MIN_CATEGORIES_FOR_ASSESSMENT,
      detail: `${summary.categoriesUsed} of ${MIN_CATEGORIES_FOR_ASSESSMENT} minimum categories covered`,
    },
  ];

  return {
    totals: {
      transactions: summary.totalTransactions,
      totalAmount: summary.totalAmountCents / 100,
      categoriesUsed: summary.categoriesUsed,
      attachments: summary.attachments,
      latestTransactionDate: summary.latestTransactionDate,
    },
    categories,
    recentTransactions: summary.recentTransactions.map(serializeTransaction),
    assessment: {
      ready: requirements.every((requirement) => requirement.met),
      requirements,
    },
  };
}

export async function describeCategoriesUsed(userId: string): Promise<string[]> {
  const summary = await getTransactionSummary(userId);
  return summary.categoryBreakdown
    .filter((entry) => entry.count > 0)
    .map((entry) => CATEGORY_DEFINITIONS[entry.category].label);
}
