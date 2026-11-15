import type { Metadata } from "next";
import { ConsumerAnalyticsPage } from "@/frontend/components/finance/ConsumerPages";

export const metadata: Metadata = { title: "Analytics" };

export default function Page() {
  return <ConsumerAnalyticsPage />;
}
