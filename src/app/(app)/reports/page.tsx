import type { Metadata } from "next";
import { ConsumerReportsPage } from "@/frontend/components/finance/ConsumerPages";

export const metadata: Metadata = { title: "Reports" };

export default function Page() {
  return <ConsumerReportsPage />;
}
