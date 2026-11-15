import {
  createLenderReport,
  listLenderReports,
} from "@/backend/http/controllers/lender-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  return listLenderReports(request);
}

export async function POST(request: Request): Promise<Response> {
  return createLenderReport(request);
}
