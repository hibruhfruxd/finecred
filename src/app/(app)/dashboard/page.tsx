import type { Metadata } from "next";
import { ConsumerDashboardPage } from "@/frontend/components/finance/ConsumerPages";

export const metadata: Metadata = { title: "Overview" };

export default function Page() {
  return <ConsumerDashboardPage />;
}
