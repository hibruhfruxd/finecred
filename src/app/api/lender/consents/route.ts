import { listLenderConsents } from "@/backend/http/controllers/lender-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return listLenderConsents(request);
}
