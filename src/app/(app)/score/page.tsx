import type { Metadata } from "next";
import { ConsumerScorePage } from "@/frontend/components/finance/ConsumerPages";

export const metadata: Metadata = { title: "Credibility score" };

export default function Page() {
  return <ConsumerScorePage />;
}
