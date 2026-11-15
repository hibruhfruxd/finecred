import type { Metadata } from "next";
import { AdminReportsPage } from "@/frontend/components/finance/AdminPages";

export const metadata: Metadata = { title: "Admin reports" };

export default function Page() {
  return <AdminReportsPage />;
}
