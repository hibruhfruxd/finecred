import { cookies } from "next/headers";
import type { SessionUser } from "@/models/auth";
import { SESSION_COOKIE, verifySessionToken } from "./token";

export async function getServerSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
