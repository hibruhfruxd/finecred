import type { Metadata } from "next";
import { AdminUsersPage } from "@/frontend/components/finance/AdminPages";

export const metadata: Metadata = { title: "Users" };

export default function Page() {
  return <AdminUsersPage />;
}
