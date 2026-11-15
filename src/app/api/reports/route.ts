import {
  GET as handleListReports,
  POST as handleCreateReport,
} from "@/backend/http/controllers/reports-collection";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return handleListReports(request);
}

export async function POST(request: Request): Promise<Response> {
  return handleCreateReport(request);
}
