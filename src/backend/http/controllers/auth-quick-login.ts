import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { ApiError, parseWithSchema, readJsonBody, withApiHandler } from "@/backend/http/errors";
import { hashPassword } from "@/backend/auth/password";
import { SESSION_MAX_AGE_SECONDS, createSessionToken } from "@/backend/auth/token";
import { setSessionCookies } from "@/backend/auth/cookies";
import { getAuthRequestContext, issueRefreshToken } from "@/backend/auth/refresh";
import {
  createUser,
  findUserByEmail,
  toPublicUser,
} from "@/backend/db/repository";
import { quickLoginSchema } from "@/models/validation/auth";

export async function POST(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const input = parseWithSchema(
      quickLoginSchema,
      await readJsonBody(request),
      "Enter your name and a valid email address.",
    );

    let user = await findUserByEmail(input.email);
    if (!user) {
      user = await createUser({
        email: input.email,
        fullName: input.name,
        passwordHash: hashPassword(randomBytes(32).toString("hex")),
        role: "consumer",
      });
    }

    if (user.status !== "active") {
      throw new ApiError(403, "account_disabled", "This account has been disabled.");
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
