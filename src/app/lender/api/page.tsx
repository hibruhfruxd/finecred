import type { Metadata } from "next";
import { LenderApiPage } from "@/frontend/components/finance/LenderPages";

export const metadata: Metadata = { title: "Lender API documentation" };

export default function Page() {
  return <LenderApiPage />;
}
