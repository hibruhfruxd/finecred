import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET(request: Request): Response {
  return NextResponse.redirect(new URL("/dashboard", request.url), 307);
}
