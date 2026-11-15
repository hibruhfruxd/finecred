import { list } from "@/backend/http/controllers/lender-applicants";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return list(request);
}
