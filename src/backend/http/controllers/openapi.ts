import { NextResponse } from "next/server";
import { openApiDocument } from "@/backend/openapi";

export async function GET(): Promise<Response> {
  return NextResponse.json(openApiDocument, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
