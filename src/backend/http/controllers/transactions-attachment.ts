import { NextResponse } from "next/server";
import { ApiError, withApiHandler } from "@/backend/http/errors";
import { requireUser } from "@/backend/auth/session";
import { findTransactionById } from "@/backend/db/repository";
import { readStoredAttachment } from "@/backend/files";

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
    if (!transaction.attachment) {
      throw new ApiError(404, "attachment_not_found", "This payment has no attachment.");
    }

    const buffer = await readStoredAttachment(user.id, transaction.attachment.storedName);
    const encodedName = encodeURIComponent(transaction.attachment.filename);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": transaction.attachment.mimeType,
        "Content-Length": String(buffer.byteLength),
        "Content-Disposition": `attachment; filename="synthetic-sample"; filename*=UTF-8''${encodedName}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  });
}
