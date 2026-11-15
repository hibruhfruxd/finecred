import { ApiError } from "@/backend/http/errors";
import { hasActiveConsent } from "@/backend/db/consents";
import type { UserRecord } from "@/models/db";
import { requireUser } from "./session";

export async function requireRole(
  request: Request,
  roles: readonly string[],
): Promise<UserRecord> {
  const user = await requireUser(request);
  if (!roles.includes(user.role)) {
    throw new ApiError(403, "forbidden", "You do not have access to this resource.");
  }
  return user;
}

export async function requireConsumer(request: Request): Promise<UserRecord> {
  return requireRole(request, ["consumer", "admin"]);
}

export async function requireLender(request: Request): Promise<UserRecord> {
  return requireRole(request, ["lender", "admin"]);
}

export async function requireAdmin(request: Request): Promise<UserRecord> {
  return requireRole(request, ["admin"]);
}

export async function assertLenderApplicantAccess(
  lenderId: string,
  applicantId: string,
): Promise<void> {
  if (lenderId === applicantId) return;
  const allowed = await hasActiveConsent(applicantId, lenderId, "assessment");
  if (!allowed) {
    throw new ApiError(
      403,
      "applicant_access_denied",
      "The applicant has not granted active assessment-sharing consent to this lender.",
    );
  }
}
