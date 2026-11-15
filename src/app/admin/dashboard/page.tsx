import type { Metadata } from "next";
import { AdminDashboardPage } from "@/frontend/components/finance/AdminPages";

export const metadata: Metadata = { title: "Admin dashboard" };

export default function Page() {
  return <AdminDashboardPage />;
}
