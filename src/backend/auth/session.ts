import { ApiError } from "@/backend/http/errors";
import { findUserById } from "@/backend/db/repository";
import type { UserRecord } from "@/models/db";
import { getSessionTokenFromRequest, verifySessionToken } from "./token";

export async function requireUser(request: Request): Promise<UserRecord> {
  const token = getSessionTokenFromRequest(request);
  if (!token) {
    throw new ApiError(401, "unauthenticated", "Please sign in to continue.");
  }

  const session = await verifySessionToken(token);
  if (!session) {
    throw new ApiError(401, "invalid_session", "Your demo session has expired. Please sign in again.");
  }

  const user = await findUserById(session.id);
  if (!user) {
    throw new ApiError(401, "invalid_session", "This demo account is no longer available.");
  }
  if (user.status !== "active") {
    throw new ApiError(403, "account_disabled", "This account has been disabled.");
  }
  if (session.authVersion !== user.authVersion) {
    throw new ApiError(
      401,
      "session_revoked",
      "Your session is no longer valid. Please sign in again.",
    );
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    status: user.status,
    authVersion: user.authVersion,
    createdAt: user.createdAt,
  };
}
