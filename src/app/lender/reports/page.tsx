import type { Metadata } from "next";
import { LenderReportsPage } from "@/frontend/components/finance/LenderPages";

export const metadata: Metadata = { title: "Lender reports" };

export default function Page() {
  return <LenderReportsPage />;
}
