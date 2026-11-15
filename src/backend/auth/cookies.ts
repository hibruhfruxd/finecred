import type { NextResponse } from "next/server";
import {
  REFRESH_COOKIE,
  REFRESH_MAX_AGE_SECONDS,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  shouldUseSecureCookies,
} from "./token";

export interface SessionCookiePayload {
  accessToken: string;
  refreshToken: string;
}

export function setSessionCookies(
  response: NextResponse,
  payload: SessionCookiePayload,
): NextResponse {
  const secure = shouldUseSecureCookies();
  response.cookies.set({
    name: SESSION_COOKIE,
    value: payload.accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  response.cookies.set({
    name: REFRESH_COOKIE,
    value: payload.refreshToken,
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/api/auth",
    maxAge: REFRESH_MAX_AGE_SECONDS,
  });
  return response;
}

export function clearSessionCookies(response: NextResponse): NextResponse {
  const secure = shouldUseSecureCookies();
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 0,
  });
  response.cookies.set({
    name: REFRESH_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/api/auth",
    maxAge: 0,
  });
  return response;
}
