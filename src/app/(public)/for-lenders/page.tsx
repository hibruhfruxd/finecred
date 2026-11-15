import type { Metadata } from "next";
import { ForLendersPage } from "@/frontend/components/finance/PublicPages";

export const metadata: Metadata = { title: "For lenders" };

export default function Page() {
  return <ForLendersPage />;
}
