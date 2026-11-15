import { NextResponse } from "next/server";
import { DEMO_ACCOUNTS } from "@/models/demo-accounts";

export async function GET(): Promise<Response> {
  return NextResponse.json(
    {
      accounts: DEMO_ACCOUNTS.map((account) => ({
        email: account.email,
        password: account.password,
        fullName: account.fullName,
        role: account.role,
        label: account.label,
        description: account.description,
        sampleData: account.sampleData,
      })),
      notice:
        "These are fictional demo-only credentials. Never use real customer identities or financial credentials.",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
