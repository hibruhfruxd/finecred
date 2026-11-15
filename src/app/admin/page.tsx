import type { Metadata } from "next";
import { AdminDashboardPage } from "@/frontend/components/finance/AdminPages";

export const metadata: Metadata = { title: "Admin workspace" };

export default function Page() {
  return <AdminDashboardPage />;
}
