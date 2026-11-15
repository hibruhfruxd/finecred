import type { Metadata } from "next";
import { ConsumerInsightsPage } from "@/frontend/components/finance/ConsumerPages";

export const metadata: Metadata = { title: "Financial insights" };

export default function Page() {
  return <ConsumerInsightsPage />;
}
