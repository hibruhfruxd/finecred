import type { Metadata } from "next";
import { LenderSettingsPage } from "@/frontend/components/finance/LenderPages";

export const metadata: Metadata = { title: "Lender settings" };

export default function Page() {
  return <LenderSettingsPage />;
}
