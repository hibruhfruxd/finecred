import type { Metadata } from "next";
import { AdminSettingsPage } from "@/frontend/components/finance/AdminPages";

export const metadata: Metadata = { title: "System settings" };

export default function Page() {
  return <AdminSettingsPage />;
}
