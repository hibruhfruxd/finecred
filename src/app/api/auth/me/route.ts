import { GET as handleCurrentUser } from "@/backend/http/controllers/auth-me";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return handleCurrentUser(request);
}
