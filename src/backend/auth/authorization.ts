import { ApiError } from "@/backend/http/errors";
import { hasActiveConsent } from "@/backend/db/consents";
import { getOrCreateDemoUser } from "@/backend/auth/demo-user";
import type { UserRecord } from "@/models/db";
import type { DemoRole } from "@/models/demo-accounts";
import { requireSessionUser } from "./session";

export async function requireRole(
  request: Request,
  roles: readonly string[],
): Promise<UserRecord> {
  try {
    const user = await requireSessionUser(request);
    if (!roles.includes(user.role)) {
      throw new ApiError(403, "forbidden", "You do not have access to this resource.");
    }
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      const fallbackRole = roles.find((role) => role === "consumer" || role === "lender" || role === "admin");
      if (fallbackRole) {
        return getOrCreateDemoUser(fallbackRole as DemoRole);
      }
    }
    throw error;
  }
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
