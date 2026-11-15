import {
  GET as handleGetConsent,
  PATCH as handleUpdateConsent,
} from "@/backend/http/controllers/consents-detail";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  return handleGetConsent(request, context);
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  return handleUpdateConsent(request, context);
}
