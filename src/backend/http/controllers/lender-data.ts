import { NextResponse } from "next/server";
import { ApiError, parseWithSchema, readJsonBody, withApiHandler } from "@/backend/http/errors";
import { requireRole } from "@/backend/auth/authorization";
import { runAssessmentForUser } from "@/backend/assessment/service";
import { listConsentsForLender } from "@/backend/db/consents";
import { findLenderApplicant } from "@/backend/db/lender";
import { createReport, listReportsForLender } from "@/backend/db/reports";
import { recordAudit, requestIdFor } from "@/backend/db/audit";
import { reportCreateSchema } from "@/models/validation/production";

export async function listLenderConsents(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireRole(request, ["lender"]);
    const consents = await listConsentsForLender(user.id);
    return NextResponse.json(
      { consents },
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}

export async function listLenderReports(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireRole(request, ["lender"]);
    const reports = await listReportsForLender(user.id);
    return NextResponse.json(
      { reports },
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}

export async function createLenderReport(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireRole(request, ["lender"]);
    const input = parseWithSchema(
      reportCreateSchema,
      await readJsonBody(request),
      "The report request is invalid.",
    );
    if (!input.applicant_id) {
      throw new ApiError(422, "validation_error", "Select an applicant for this report.", {
        applicant_id: "Applicant is required.",
      });
    }

    const applicant = await findLenderApplicant(user.id, input.applicant_id);
    if (!applicant) {
      throw new ApiError(
        404,
        "applicant_not_found",
        "This applicant is not authorized for your lender organization.",
      );
    }

    let assessment;
    try {
      assessment = await runAssessmentForUser(
        input.applicant_id,
        input.lookback_months,
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error("[fincred-lender-reports] Assessment failure:", error);
      throw new ApiError(
        503,
        "assessment_engine_unavailable",
        "The assessment engine could not complete this report.",
      );
    }

    const report = await createReport({
      userId: input.applicant_id,
      requestedBy: user.id,
      assessment,
    });
    await recordAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "lender.report.create",
      targetType: "report",
      targetId: report.id,
      requestId: requestIdFor(request),
      metadata: { applicantId: input.applicant_id, score: report.score },
    });

    return NextResponse.json(
      { report },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  });
}
