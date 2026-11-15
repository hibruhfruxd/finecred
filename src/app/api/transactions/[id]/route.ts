import { GET as handleGetTransaction } from "@/backend/http/controllers/transactions-detail";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  return handleGetTransaction(request, context);
}
