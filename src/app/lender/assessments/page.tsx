import type { Metadata } from "next";
import { LenderAssessmentsPage } from "@/frontend/components/finance/LenderPages";

export const metadata: Metadata = { title: "Assessments" };

export default function Page() {
  return <LenderAssessmentsPage />;
}
