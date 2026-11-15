import { POST as handleLogin } from "@/backend/http/controllers/auth-login";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  return handleLogin(request);
}
