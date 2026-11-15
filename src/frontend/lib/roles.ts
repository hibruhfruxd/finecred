import type { DemoRole } from "@/models/demo-accounts";

export function isDemoRole(value: string): value is DemoRole {
  return value === "consumer" || value === "lender" || value === "admin";
}

export function roleHome(role: string): string {
  if (role === "lender") return "/lender/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/dashboard";
}
