import { NextResponse } from "next/server";
import { ApiError, withApiHandler } from "@/backend/http/errors";
import { requireUser } from "@/backend/auth/session";
import { findReportById, findReportForLender } from "@/backend/db/reports";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireUser(request);
    const { id } = await context.params;
    const report =
      user.role === "lender"
        ? await findReportForLender(id, user.id)
        : await findReportById(id);

    if (!report) {
      throw new ApiError(404, "report_not_found", "This report does not exist.");
    }
    if (user.role === "consumer" && report.userId !== user.id) {
      throw new ApiError(403, "forbidden", "You do not have access to this report.");
    }

    return NextResponse.json(
      { report, immutable: true },
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}
