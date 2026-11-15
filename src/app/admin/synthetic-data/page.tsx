import type { Metadata } from "next";
import { AdminSyntheticDataPage } from "@/frontend/components/finance/AdminPages";

export const metadata: Metadata = { title: "Synthetic data" };

export default function Page() {
  return <AdminSyntheticDataPage />;
}
