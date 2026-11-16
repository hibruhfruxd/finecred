import { DEMO_ACCOUNTS, type DemoRole } from "@/models/demo-accounts";
import type { SessionUser } from "@/models/auth";

export function getDemoSessionUser(role: DemoRole): SessionUser {
  const account = DEMO_ACCOUNTS.find((entry) => entry.role === role);
  if (!account) {
    throw new Error(`Demo ${role} account is not configured.`);
  }
  return {
    id: `demo-${role}`,
    email: account.email,
    name: account.fullName,
    role,
    authVersion: 1,
  };
}
