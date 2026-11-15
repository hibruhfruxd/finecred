import type { Metadata } from "next";
import { LenderDashboardPage } from "@/frontend/components/finance/LenderPages";

export const metadata: Metadata = { title: "Lender workspace" };

export default function Page() {
  return <LenderDashboardPage />;
}
