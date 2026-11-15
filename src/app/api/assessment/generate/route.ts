import { POST as handleGenerateAssessment } from "@/backend/http/controllers/assessment-generate";

export const dynamic = "force-dynamic";

export async function POST(request: Request): Promise<Response> {
  return handleGenerateAssessment(request);
}
