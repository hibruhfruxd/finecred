import type { Metadata } from "next";
import { ConsumerPaymentsPage } from "@/frontend/components/finance/ConsumerPages";

export const metadata: Metadata = { title: "My payments" };

export default function Page() {
  return <ConsumerPaymentsPage />;
}
