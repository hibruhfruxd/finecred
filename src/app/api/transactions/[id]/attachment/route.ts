import { GET as handleDownloadAttachment } from "@/backend/http/controllers/transactions-attachment";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  return handleDownloadAttachment(request, context);
}
