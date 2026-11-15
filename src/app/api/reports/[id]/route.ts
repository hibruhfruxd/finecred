import { GET as handleGetReport } from "@/backend/http/controllers/reports-detail";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  return handleGetReport(request, context);
}
