import { overview } from "@/backend/http/controllers/admin-console";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return overview(request);
}