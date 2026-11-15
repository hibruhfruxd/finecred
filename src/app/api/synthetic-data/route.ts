import {
  GET as handleListSyntheticJobs,
  POST as handleGenerateSyntheticData,
} from "@/backend/http/controllers/synthetic-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return handleListSyntheticJobs(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleGenerateSyntheticData(request);
}
