import type { Metadata } from "next";
import { AboutPage } from "@/frontend/components/finance/PublicPages";

export const metadata: Metadata = { title: "About" };

export default function Page() {
  return <AboutPage />;
}
