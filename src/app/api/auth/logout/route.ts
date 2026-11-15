import { POST as handleLogout } from "@/backend/http/controllers/auth-logout";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  return handleLogout(request);
}
