import { NextResponse } from "next/server";
import { getDatabaseDialect, getDb } from "@/backend/db";

export async function GET(): Promise<Response> {
  try {
    const db = await getDb();
    await db.queryOne("SELECT 1 AS ok");
    return NextResponse.json({
      status: "ok",
      service: "fincred-demo",
      mode: "synthetic-demo-only",
      database: getDatabaseDialect(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[fincred-health] Database check failed:", error);
    return NextResponse.json(
      {
        status: "degraded",
        service: "fincred-demo",
        mode: "synthetic-demo-only",
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
