import { GET as handleDemoAccounts } from "@/backend/http/controllers/auth-demo-accounts";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return handleDemoAccounts();
}
