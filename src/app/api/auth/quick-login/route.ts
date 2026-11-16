import { POST as handleQuickLogin } from "@/backend/http/controllers/auth-quick-login";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  return handleQuickLogin(request);
}
