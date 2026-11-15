import type { Metadata } from "next";
import { ConsumerHelpPage } from "@/frontend/components/finance/ConsumerPages";

export const metadata: Metadata = { title: "Help & support" };

export default function Page() {
  return <ConsumerHelpPage />;
}
