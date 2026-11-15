import { NextResponse } from "next/server";
import { ApiError, parseWithSchema, readJsonBody, withApiHandler } from "@/backend/http/errors";
import { hashPassword, needsPasswordRehash, verifyPassword } from "@/backend/auth/password";
import { SESSION_MAX_AGE_SECONDS, createSessionToken } from "@/backend/auth/token";
import { setSessionCookies } from "@/backend/auth/cookies";
import { getAuthRequestContext, issueRefreshToken } from "@/backend/auth/refresh";
import {
  findUserByEmail,
  toPublicUser,
  updateUserPasswordHash,
} from "@/backend/db/repository";
import { loginSchema } from "@/models/validation/auth";

export async function POST(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const input = parseWithSchema(
      loginSchema,
      await readJsonBody(request),
      "Enter a valid demo email address and password.",
    );

    const user = await findUserByEmail(input.email);
    if (!user || !verifyPassword(input.password, user.passwordHash)) {
      throw new ApiError(
        401,
        "invalid_credentials",
        "The demo email or password is incorrect. Use one of the credentials shown on the login page.",
      );
    }

    if (user.status !== "active") {
      throw new ApiError(403, "account_disabled", "This account has been disabled.");
    }

    if (needsPasswordRehash(user.passwordHash)) {
      const passwordHash = hashPassword(input.password);
      await updateUserPasswordHash(user.id, passwordHash);
      user.passwordHash = passwordHash;
    }

    const accessToken = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      authVersion: user.authVersion,
    });
    const refresh = await issueRefreshToken(user.id, getAuthRequestContext(request));

    const response = NextResponse.json({
      user: toPublicUser(user),
      expiresIn: SESSION_MAX_AGE_SECONDS,
    });
    setSessionCookies(response, {
      accessToken,
      refreshToken: refresh.rawToken,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  });
}
