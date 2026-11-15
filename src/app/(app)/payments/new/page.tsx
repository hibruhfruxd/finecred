import type { Metadata } from "next";
import { ConsumerNewPaymentPage } from "@/frontend/components/finance/ConsumerPages";

export const metadata: Metadata = { title: "Add payment" };

export default function Page() {
  return <ConsumerNewPaymentPage />;
}
