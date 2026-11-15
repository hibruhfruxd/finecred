import { NextResponse } from "next/server";
import { ApiError, parseWithSchema, readJsonBody, withApiHandler } from "@/backend/http/errors";
import { requireUser } from "@/backend/auth/session";
import { findUserById } from "@/backend/db/repository";
import {
  generateSyntheticData,
  listSyntheticJobs,
} from "@/backend/db/synthetic-jobs";
import { recordAudit, requestIdFor } from "@/backend/db/audit";
import { syntheticJobCreateSchema } from "@/models/validation/production";

export async function GET(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireUser(request);
    const jobs = await listSyntheticJobs(user.role === "admin" ? undefined : user.id);
    return NextResponse.json(
      { jobs },
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}

export async function POST(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireUser(request);
    const input = parseWithSchema(
      syntheticJobCreateSchema,
      await readJsonBody(request),
      "The synthetic data request is invalid.",
    );

    let targetUserId = user.id;
    if (input.user_id && input.user_id !== user.id) {
      if (user.role !== "admin") {
        throw new ApiError(403, "forbidden", "Only an administrator can generate for another user.");
      }
      const target = await findUserById(input.user_id);
      if (!target || target.status !== "active") {
        throw new ApiError(404, "user_not_found", "The target account does not exist.");
      }
      targetUserId = target.id;
    }

    const job = await generateSyntheticData({
      userId: targetUserId,
      requestedBy: user.id,
      categories: input.categories,
      recordCount: input.record_count,
      lookbackMonths: input.lookback_months,
    });
    await recordAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "synthetic_data.generate",
      targetType: "synthetic_job",
      targetId: job.id,
      requestId: requestIdFor(request),
      metadata: {
        userId: targetUserId,
        categories: job.categories,
        recordCount: job.recordCount,
      },
    });

    return NextResponse.json(
      { job },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  });
}
