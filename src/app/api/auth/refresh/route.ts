import { POST as handleRefresh } from "@/backend/http/controllers/auth-refresh";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  return handleRefresh(request);
}
