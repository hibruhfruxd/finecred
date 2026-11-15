import type { Metadata } from "next";
import { AccessibilityPage } from "@/frontend/components/finance/PublicPages";

export const metadata: Metadata = { title: "Accessibility" };

export default function Page() {
  return <AccessibilityPage />;
}
