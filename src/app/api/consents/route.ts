import {
  GET as handleListConsents,
  POST as handleCreateConsent,
} from "@/backend/http/controllers/consents-collection";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return handleListConsents(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleCreateConsent(request);
}
