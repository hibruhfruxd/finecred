import { randomBytes } from "node:crypto";
import { hashPassword } from "./password";
import { createUser, findUserByEmail } from "@/backend/db/repository";
import { DEMO_ACCOUNTS, type DemoRole } from "@/models/demo-accounts";
import type { UserRecord } from "@/models/db";

export async function getOrCreateDemoUser(role: DemoRole): Promise<UserRecord> {
  const account = DEMO_ACCOUNTS.find((entry) => entry.role === role);
  if (!account) {
    throw new Error(`Demo ${role} account is not configured.`);
  }

  const existing = await findUserByEmail(account.email);
  if (existing) return existing;

  return createUser({
    email: account.email,
    fullName: account.fullName,
    passwordHash: hashPassword(randomBytes(32).toString("hex")),
    role: account.role,
  });
}
