import { detail } from "@/backend/http/controllers/lender-applicants";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  return detail(request, context);
}
