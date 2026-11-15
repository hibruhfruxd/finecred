import { NextResponse } from "next/server";
import { ApiError, parseWithSchema, readJsonBody, withApiHandler } from "@/backend/http/errors";
import { requireRole } from "@/backend/auth/authorization";
import { findLenderApplicant } from "@/backend/db/lender";
import { createLenderNote, deleteLenderNote, listLenderNotes } from "@/backend/db/lender-notes";
import { findOrganizationForUser } from "@/backend/db/organizations";
import { recordAudit, requestIdFor } from "@/backend/db/audit";
import { lenderNoteCreateSchema } from "@/models/validation/production";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function list(request: Request, context: RouteContext): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireRole(request, ["lender"]);
    const { id } = await context.params;
    const applicant = await findLenderApplicant(user.id, id);
    if (!applicant) {
      throw new ApiError(404, "applicant_not_found", "This applicant is not authorized.");
    }
    const notes = await listLenderNotes(id, user.id);
    return NextResponse.json({ notes }, { headers: { "Cache-Control": "no-store" } });
  });
}

export async function create(request: Request, context: RouteContext): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireRole(request, ["lender"]);
    const { id } = await context.params;
    const applicant = await findLenderApplicant(user.id, id);
    if (!applicant) {
      throw new ApiError(404, "applicant_not_found", "This applicant is not authorized.");
    }

    const input = parseWithSchema(
      lenderNoteCreateSchema,
      await readJsonBody(request),
      "The lender note is invalid.",
    );
    const membership = await findOrganizationForUser(user.id);
    if (input.organization_id && membership?.organization.id !== input.organization_id) {
      throw new ApiError(403, "forbidden", "You do not belong to that lender organization.");
    }

    const note = await createLenderNote({
      lenderId: user.id,
      applicantId: id,
      organizationId: membership?.organization.id ?? null,
      body: input.body,
    });
    await recordAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "lender.note.create",
      targetType: "lender_note",
      targetId: note.id,
      requestId: requestIdFor(request),
      metadata: { applicantId: id },
    });
    return NextResponse.json(
      { note },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  });
}

export async function remove(request: Request, context: RouteContext): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireRole(request, ["lender"]);
    const { id } = await context.params;
    const deleted = await deleteLenderNote(id, user.id);
    if (!deleted) {
      throw new ApiError(404, "note_not_found", "This lender note does not exist.");
    }
    await recordAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "lender.note.delete",
      targetType: "lender_note",
      targetId: id,
      requestId: requestIdFor(request),
    });
    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  });
}
