import { GET as handleTransactionSummary } from "@/backend/http/controllers/transactions-summary";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return handleTransactionSummary(request);
}
