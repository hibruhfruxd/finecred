import { NextResponse } from "next/server";
import { withApiHandler } from "@/backend/http/errors";
import { requireUser } from "@/backend/auth/session";
import { getSummaryForUser } from "@/backend/transactions/summary";

export async function GET(request: Request): Promise<Response> {
  return withApiHandler(async () => {
    const user = await requireUser(request);
    return NextResponse.json(await getSummaryForUser(user.id), {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  });
}
