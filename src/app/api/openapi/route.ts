import { GET as handleOpenApi } from "@/backend/http/controllers/openapi";

export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return handleOpenApi();
}
