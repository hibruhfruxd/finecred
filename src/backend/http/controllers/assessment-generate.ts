import { NextResponse } from "next/server";
import { ApiError, parseWithSchema, readJsonBody, withApiHandler } from "@/backend/http/errors";
import { runAssessmentForUser } from "@/backend/assessment/service";
import { requireUser } from "@/backend/auth/session";
import { assessmentRequestSchema } from "@/models/validation/assessment";

export async function POST(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireUser(request);
    const requestInput = parseWithSchema(
      assessmentRequestSchema,
      await readJsonBody(request),
      "The assessment request is invalid.",
    );

    try {
      const result = await runAssessmentForUser(user.id, requestInput.lookback_months);
      return NextResponse.json(result, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      console.error("[fincred-assessment] Engine failure:", error);
      throw new ApiError(
        503,
        "assessment_engine_unavailable",
        "The assessment engine could not complete this request. Please try again.",
      );
    }
  });
}
