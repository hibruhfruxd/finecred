import type { Metadata } from "next";
import { FeaturesPage } from "@/frontend/components/finance/PublicPages";

export const metadata: Metadata = { title: "Features" };

export default function Page() {
  return <FeaturesPage />;
}
