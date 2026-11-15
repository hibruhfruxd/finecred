import type { Metadata } from "next";
import { MethodologyPage } from "@/frontend/components/finance/PublicPages";

export const metadata: Metadata = { title: "Methodology" };

export default function Page() {
  return <MethodologyPage />;
}
