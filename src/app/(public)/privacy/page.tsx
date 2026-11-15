import type { Metadata } from "next";
import { PrivacyPage } from "@/frontend/components/finance/PublicPages";

export const metadata: Metadata = { title: "Privacy" };

export default function Page() {
  return <PrivacyPage />;
}
