import { GET as handleHealth } from "@/backend/http/controllers/health";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return handleHealth();
}
