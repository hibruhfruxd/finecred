import type { Metadata } from "next";
import { HowItWorksPage } from "@/frontend/components/finance/PublicPages";

export const metadata: Metadata = { title: "How it works" };

export default function Page() {
  return <HowItWorksPage />;
}
