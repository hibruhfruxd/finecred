import type { Metadata } from "next";
import { AdminPaymentsPage } from "@/frontend/components/finance/AdminPages";

export const metadata: Metadata = { title: "Payment records" };

export default function Page() {
  return <AdminPaymentsPage />;
}
