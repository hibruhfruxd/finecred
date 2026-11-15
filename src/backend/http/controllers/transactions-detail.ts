import { NextResponse } from "next/server";
import { ApiError, withApiHandler } from "@/backend/http/errors";
import { requireUser } from "@/backend/auth/session";
import { findTransactionById } from "@/backend/db/repository";
import { serializeTransaction } from "@/backend/transactions/serializers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireUser(request);
    const { id } = await params;
    const transaction = await findTransactionById(user.id, id);
    if (!transaction) {
      throw new ApiError(404, "transaction_not_found", "Transaction not found.");
    }

    return NextResponse.json(
      { transaction: serializeTransaction(transaction) },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  });
}
