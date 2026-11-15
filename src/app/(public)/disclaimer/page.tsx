import type { Metadata } from "next";
import { DisclaimerPage } from "@/frontend/components/finance/PublicPages";

export const metadata: Metadata = { title: "Disclaimer" };

export default function Page() {
  return <DisclaimerPage />;
}
