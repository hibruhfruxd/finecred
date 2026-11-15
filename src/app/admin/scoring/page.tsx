import type { Metadata } from "next";
import { AdminScoringPage } from "@/frontend/components/finance/AdminPages";

export const metadata: Metadata = { title: "Scoring engine" };

export default function Page() {
  return <AdminScoringPage />;
}
