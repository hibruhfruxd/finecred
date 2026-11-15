import type { Metadata } from "next";
import { AdminLendersPage } from "@/frontend/components/finance/AdminPages";

export const metadata: Metadata = { title: "Lender organizations" };

export default function Page() {
  return <AdminLendersPage />;
}
