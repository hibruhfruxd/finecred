import type { Metadata } from "next";
import { ConsumerSettingsPage } from "@/frontend/components/finance/ConsumerPages";

export const metadata: Metadata = { title: "Settings" };

export default function Page() {
  return <ConsumerSettingsPage />;
}
