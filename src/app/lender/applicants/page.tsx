import type { Metadata } from "next";
import { LenderApplicantsPage } from "@/frontend/components/finance/LenderPages";

export const metadata: Metadata = { title: "Authorized applicants" };

export default function Page() {
  return <LenderApplicantsPage />;
}
