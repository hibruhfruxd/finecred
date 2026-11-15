import { NextResponse } from "next/server";
import { ApiError, withApiHandler } from "@/backend/http/errors";
import { requireRole } from "@/backend/auth/authorization";
import { getTransactionSummary } from "@/backend/db/repository";
import { listLenderApplicants, findLenderApplicant } from "@/backend/db/lender";
import { listConsentsForLender } from "@/backend/db/consents";
import { listLenderNotes } from "@/backend/db/lender-notes";
import { listReportsForLender } from "@/backend/db/reports";
import { recordAudit, requestIdFor } from "@/backend/db/audit";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function list(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireRole(request, ["lender"]);
    const applicants = await listLenderApplicants(user.id);
    return NextResponse.json(
      { applicants },
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}

export async function detail(request: Request, context: RouteContext): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireRole(request, ["lender"]);
    const { id } = await context.params;
    const applicant = await findLenderApplicant(user.id, id);
    if (!applicant) {
      throw new ApiError(
        404,
        "applicant_not_found",
        "This applicant is not authorized for your lender organization.",
      );
    }

    const [summary, consents, notes, reports] = await Promise.all([
      getTransactionSummary(id),
      listConsentsForLender(user.id),
      listLenderNotes(id, user.id),
      listReportsForLender(user.id),
    ]);

    await recordAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "lender.applicant.view",
      targetType: "user",
      targetId: id,
      requestId: requestIdFor(request),
    });

    return NextResponse.json(
      {
        applicant,
        paymentSummary: {
          totalTransactions: summary.totalTransactions,
          totalAmountCents: summary.totalAmountCents,
          categoriesUsed: summary.categoriesUsed,
          attachments: summary.attachments,
          categoryBreakdown: summary.categoryBreakdown,
          latestTransactionDate: summary.latestTransactionDate,
        },
        consents: consents.filter((consent) => consent.userId === id),
        notes,
        reports: reports.filter((report) => report.userId === id),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}
