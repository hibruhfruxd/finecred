import type { Metadata } from "next";
import { FaqPage } from "@/frontend/components/finance/PublicPages";

export const metadata: Metadata = { title: "FAQ" };

export default function Page() {
  return <FaqPage />;
}
