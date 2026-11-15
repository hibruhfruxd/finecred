import type { Metadata } from "next";
import { TermsPage } from "@/frontend/components/finance/PublicPages";

export const metadata: Metadata = { title: "Terms" };

export default function Page() {
  return <TermsPage />;
}
