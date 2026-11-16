import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { hashPassword } from "@/backend/auth/password";
import { SESSION_MAX_AGE_SECONDS, createSessionToken } from "@/backend/auth/token";
import { setSessionCookies } from "@/backend/auth/cookies";
import { getAuthRequestContext, issueRefreshToken } from "@/backend/auth/refresh";
import { createUser, findUserByEmail } from "@/backend/db/repository";
import { DEMO_ACCOUNTS } from "@/models/demo-accounts";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<Response> {
  const demo = DEMO_ACCOUNTS.find((account) => account.role === "consumer");
  try {
    if (!demo) throw new Error("Demo consumer account is not configured.");

    let user = await findUserByEmail(demo.email);
    if (!user) {
      user = await createUser({
        email: demo.email,
        fullName: demo.fullName,
        passwordHash: hashPassword(randomBytes(32).toString("hex")),
        role: "consumer",
      });
    }

    const accessToken = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.fullName,
      role: user.role,
      authVersion: user.authVersion,
    });
    const refresh = await issueRefreshToken(user.id, getAuthRequestContext(request));

    const response = NextResponse.redirect(new URL("/dashboard", request.url), 307);
    setSessionCookies(response, {
      accessToken,
      refreshToken: refresh.rawToken,
    });
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    console.error("[fincred-explore] Automatic demo sign-in failed:", error);
    return NextResponse.redirect(new URL("/login", request.url), 307);
  }
}
