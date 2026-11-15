import { remove } from "@/backend/http/controllers/lender-notes";

export const dynamic = "force-dynamic";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  return remove(request, context);
}
