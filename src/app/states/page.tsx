import type { Metadata } from "next";
import { PublicShell } from "@/frontend/components/finance/PublicShell";
import { StatesPage } from "@/frontend/components/finance/DesignSystemPages";

export const metadata: Metadata = { title: "Required UI states" };

export default function Page() {
  return <PublicShell><StatesPage /></PublicShell>;
}
