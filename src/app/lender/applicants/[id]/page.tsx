import type { Metadata } from "next";
import { LenderApplicantDetailPage } from "@/frontend/components/finance/LenderPages";

export const metadata: Metadata = { title: "Applicant detail" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <LenderApplicantDetailPage id={id} />;
}
