import { NextResponse } from "next/server";
import { ApiError, parseWithSchema, readJsonBody, withApiHandler } from "@/backend/http/errors";
import { requireConsumer } from "@/backend/auth/authorization";
import { runAssessmentForUser } from "@/backend/assessment/service";
import { createReport, listReportsForUser } from "@/backend/db/reports";
import { recordAudit, requestIdFor } from "@/backend/db/audit";
import { reportCreateSchema } from "@/models/validation/production";

export async function GET(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireConsumer(request);
    const reports = await listReportsForUser(user.id);
    return NextResponse.json(
      { reports },
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}

export async function POST(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireConsumer(request);
    const input = parseWithSchema(
      reportCreateSchema,
      await readJsonBody(request),
      "The report request is invalid.",
    );

    let assessment;
    try {
      assessment = await runAssessmentForUser(user.id, input.lookback_months);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error("[fincred-reports] Assessment failure:", error);
      throw new ApiError(
        503,
        "assessment_engine_unavailable",
        "The assessment engine could not complete this report.",
      );
    }

    const report = await createReport({
      userId: user.id,
      requestedBy: user.id,
      assessment,
    });
    await recordAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "report.create",
      targetType: "report",
      targetId: report.id,
      requestId: requestIdFor(request),
      metadata: { reportVersion: report.reportVersion, score: report.score },
    });

    return NextResponse.json(
      { report },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  });
}
