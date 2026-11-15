import type { Metadata } from "next";
import { AdminConsentsPage } from "@/frontend/components/finance/AdminPages";

export const metadata: Metadata = { title: "Consent records" };

export default function Page() {
  return <AdminConsentsPage />;
}
