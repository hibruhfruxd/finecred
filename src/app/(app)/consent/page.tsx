import type { Metadata } from "next";
import { ConsumerConsentPage } from "@/frontend/components/finance/ConsumerPages";

export const metadata: Metadata = { title: "Consent & privacy" };

export default function Page() {
  return <ConsumerConsentPage />;
}
