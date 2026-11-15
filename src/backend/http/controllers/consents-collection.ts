import { NextResponse } from "next/server";
import { ApiError, parseWithSchema, readJsonBody, withApiHandler } from "@/backend/http/errors";
import { requireConsumer } from "@/backend/auth/authorization";
import { createConsent, listConsentsForUser } from "@/backend/db/consents";
import { recordAudit, requestIdFor } from "@/backend/db/audit";
import { findUserByEmail } from "@/backend/db/repository";
import { consentCreateSchema } from "@/models/validation/production";

function expiryFromDate(value: string | undefined): string | null {
  if (!value) return null;
  const date = new Date(`${value}T23:59:59.999Z`);
  if (Number.isNaN(date.getTime())) {
    throw new ApiError(422, "validation_error", "Enter a valid consent expiry date.");
  }
  if (date.getTime() <= Date.now()) {
    throw new ApiError(422, "validation_error", "Consent expiry must be in the future.", {
      expires_at: "Choose a future date.",
    });
  }
  return date.toISOString();
}

export async function GET(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireConsumer(request);
    const consents = await listConsentsForUser(user.id);
    return NextResponse.json(
      { consents },
      { headers: { "Cache-Control": "no-store" } },
    );
  });
}

export async function POST(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireConsumer(request);
    const input = parseWithSchema(
      consentCreateSchema,
      await readJsonBody(request),
      "The consent request is invalid.",
    );

    let lenderId: string | null = null;
    if (input.lender_email) {
      const lender = await findUserByEmail(input.lender_email);
      if (!lender || lender.role !== "lender" || lender.status !== "active") {
        throw new ApiError(422, "validation_error", "The selected lender is unavailable.", {
          lender_email: "Choose an active lender account.",
        });
      }
      lenderId = lender.id;
    }

    const consent = await createConsent({
      userId: user.id,
      lenderId,
      purpose: input.purpose,
      description: input.description,
      scope: input.scope,
      expiresAt: expiryFromDate(input.expires_at),
    });
    await recordAudit({
      actorId: user.id,
      actorRole: user.role,
      action: "consent.create",
      targetType: "consent",
      targetId: consent.id,
      requestId: requestIdFor(request),
      metadata: {
        purpose: consent.purpose,
        lenderId: consent.lenderId,
        scope: consent.scope,
      },
    });

    return NextResponse.json(
      { consent },
      { status: 201, headers: { "Cache-Control": "no-store" } },
    );
  });
}
