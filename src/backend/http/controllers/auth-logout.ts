import { NextResponse } from "next/server";
import { withApiHandler } from "@/backend/http/errors";
import { clearSessionCookies } from "@/backend/auth/cookies";
import { getRefreshTokenFromRequest } from "@/backend/auth/token";
import { revokeRefreshTokenByRaw } from "@/backend/db/refresh-tokens";

export async function POST(request?: Request): Promise<Response> {
  return withApiHandler(async () => {
    const refreshToken = request ? getRefreshTokenFromRequest(request) : null;
    if (refreshToken) {
      await revokeRefreshTokenByRaw(refreshToken);
    }

    const response = NextResponse.json({ success: true });
    clearSessionCookies(response);
    response.headers.set("Cache-Control", "no-store");
    return response;
  });
}
