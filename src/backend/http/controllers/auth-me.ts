import { NextResponse } from "next/server";
import { withApiHandler } from "@/backend/http/errors";
import { requireUser } from "@/backend/auth/session";

export async function GET(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireUser(request);
    return NextResponse.json(
      { user },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  });
}
