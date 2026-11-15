import { NextResponse } from "next/server";
import { ApiError, parseWithSchema, readFormData, withApiHandler } from "@/backend/http/errors";
import { requireUser } from "@/backend/auth/session";
import { listTransactions } from "@/backend/db/repository";
import { removeStoredAttachment, validateAndStoreAttachment } from "@/backend/files";
import { createTransactionForUser } from "@/backend/transactions/service";
import { serializeTransaction } from "@/backend/transactions/serializers";
import {
  transactionInputSchema,
  transactionListQuerySchema,
} from "@/models/validation/transaction";

export async function GET(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireUser(request);
    const url = new URL(request.url);
    const rawQuery: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      rawQuery[key] = value;
    });

    const query = parseWithSchema(
      transactionListQuerySchema,
      rawQuery,
      "The transaction filter is invalid.",
    );
    const transactions = await listTransactions(user.id, {
      category: query.category,
      limit: query.limit ?? 100,
    });

    return NextResponse.json(
      {
        transactions: transactions.map(serializeTransaction),
        count: transactions.length,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  });
}

export async function POST(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireUser(request);
    const form = await readFormData(request);

    const metadataValue = form.get("metadata");
    let metadata: unknown = {};
    if (typeof metadataValue === "string" && metadataValue.trim().length > 0) {
      try {
        metadata = JSON.parse(metadataValue) as unknown;
      } catch {
        throw new ApiError(
          422,
          "validation_error",
          "The category-specific payment details are invalid.",
          { metadata: "Category-specific payment details must be valid JSON." },
        );
      }
    }

    const input = parseWithSchema(
      transactionInputSchema,
      {
        category: form.get("category"),
        amount: form.get("amount"),
        transaction_date: form.get("transaction_date"),
        platform: form.get("platform"),
        description: form.get("description"),
        metadata,
      },
      "Please correct the highlighted payment details.",
    );

    const attachmentValue = form.get("attachment");
    if (attachmentValue !== null && !(attachmentValue instanceof File)) {
      throw new ApiError(422, "invalid_attachment", "The uploaded attachment is invalid.", {
        attachment: "Select a valid PDF, JPG, JPEG, or PNG sample.",
      });
    }

    let attachment = null;
    if (attachmentValue instanceof File) {
      attachment = await validateAndStoreAttachment(attachmentValue, user.id);
    }

    try {
      const transaction = await createTransactionForUser(user.id, input, attachment);
      return NextResponse.json(
        { transaction: serializeTransaction(transaction) },
        {
          status: 201,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error) {
      if (attachment) {
        await removeStoredAttachment(user.id, attachment.storedName);
      }
      throw error;
    }
  });
}
