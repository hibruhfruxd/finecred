import type { Metadata } from "next";
import { PublicShell } from "@/frontend/components/finance/PublicShell";
import { ResponsiveThemingPage } from "@/frontend/components/finance/DesignSystemPages";

export const metadata: Metadata = { title: "Responsive and theming" };

export default function Page() {
  return <PublicShell><ResponsiveThemingPage /></PublicShell>;
}
