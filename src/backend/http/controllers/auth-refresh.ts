import { NextResponse } from "next/server";
import { ApiError, withApiHandler } from "@/backend/http/errors";
import { clearSessionCookies, setSessionCookies } from "@/backend/auth/cookies";
import { getAuthRequestContext, rotateRefreshToken } from "@/backend/auth/refresh";
import {
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
  getRefreshTokenFromRequest,
} from "@/backend/auth/token";
import { findUserById, toPublicUser } from "@/backend/db/repository";
import { revokeAllRefreshTokensForUser } from "@/backend/db/refresh-tokens";

export async function POST(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const rawToken = getRefreshTokenFromRequest(request);
    if (!rawToken) {
      throw new ApiError(401, "invalid_refresh_token", "Please sign in to continue.");
    }

    let rotated: Awaited<ReturnType<typeof rotateRefreshToken>>;
    try {
      rotated = await rotateRefreshToken(rawToken, getAuthRequestContext(request));
    } catch (error) {
      if (error instanceof ApiError) {
        const response = NextResponse.json(
          {
            error: {
              code: error.code,
              message: error.message,
            },
          },
          { status: error.status, headers: { "Cache-Control": "no-store" } },
        );
        clearSessionCookies(response);
        return response;
      }
      throw error;
    }

    const user = await findUserById(rotated.userId);
    if (!user) {
      throw new ApiError(401, "invalid_session", "This account is no longer available.");
    }
    if (user.status !== "active") {
      await revokeAllRefreshTokensForUser(user.id);
      const response = NextResponse.json(
        {
          error: {
            code: "account_disabled",
            message: "This account has been disabled.",
          },
        },
        { status: 403, headers: { "Cache-Control": "no-store" } },
      );
      clearSessionCookies(response);
      return response;
    }

    const accessToken = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      authVersion: user.authVersion,
    });

    const response = NextResponse.json({
      user: toPublicUser(user),
      expiresIn: SESSION_MAX_AGE_SECONDS,
    });
    setSessionCookies(response, {
      accessToken,
      refreshToken: rotated.refreshToken.rawToken,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  });
}
