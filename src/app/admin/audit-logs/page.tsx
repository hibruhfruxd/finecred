import type { Metadata } from "next";
import { AdminAuditLogsPage } from "@/frontend/components/finance/AdminPages";

export const metadata: Metadata = { title: "Audit logs" };

export default function Page() {
  return <AdminAuditLogsPage />;
}
