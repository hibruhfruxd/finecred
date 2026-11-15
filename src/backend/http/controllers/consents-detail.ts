import { NextResponse } from "next/server";
import { ApiError, parseWithSchema, readJsonBody, withApiHandler } from "@/backend/http/errors";
import { requireUser } from "@/backend/auth/session";
import {
  findConsentById,
  updateConsentStatus,
} from "@/backend/db/consents";
import { recordAudit, requestIdFor } from "@/backend/db/audit";
import { consentUpdateSchema } from "@/models/validation/production";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function expiryFromInput(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  const date = new Date(`${value}T23:59:59.999Z`);
  if (Number.isNaN(date.getTime()) || date.getTime() <= Date.now()) {
    throw new ApiError(422, "validation_error", "Consent expiry must be a future date.", {
      expires_at: "Choose a future date.",
    });
  }
  return date.toISOString();
}

export async function GET(request: Request, context: RouteContext): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireUser(request);
    const { id } = await context.params;
    const consent = await findConsentById(id);
    if (!consent) {
      throw new ApiError(404, "consent_not_found", "This consent record does not exist.");
    }
    const allowed =
      user.role === "admin" ||
      consent.userId === user.id ||
      (user.role === "lender" && consent.lenderId === user.id);
    if (!allowed) {
      throw new ApiError(403, "forbidden", "You do not have access to this consent record.");
    }
    return NextResponse.json({ consent }, { headers: { "Cache-Control": "no-store" } });
  });
}

export async function PATCH(request: Request, context: RouteContext): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireUser(request);
    if (user.role !== "consumer" && user.role !== "admin") {
      throw new ApiError(403, "forbidden", "Only the consumer can change consent.");
    }
    const { id } = await context.params;
    const existing = await findConsentById(id);
    if (!existing) {
      throw new ApiError(404, "consent_not_found", "This consent record does not exist.");
    }
    if (existing.userId !== user.id && user.role !== "admin") {
      throw new ApiError(403, "forbidden", "You can only change your own consent.");
    }

    const input = parseWithSchema(
      consentUpdateSchema,
      await readJsonBody(request),
      "The consent update is invalid.",
    );
    const consent = await updateConsentStatus({
      id,
      status: input.status,
      expiresAt: expiryFromInput(input.expires_at),
    });
    await recordAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "consent.update",
      targetType: "consent",
      targetId: id,
      requestId: requestIdFor(request),
      metadata: { status: input.status },
    });
    return NextResponse.json({ consent }, { headers: { "Cache-Control": "no-store" } });
  });
}
