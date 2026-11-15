import {
  GET as handleListTransactions,
  POST as handleCreateTransaction,
} from "@/backend/http/controllers/transactions-collection";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return handleListTransactions(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleCreateTransaction(request);
}
