import type { Metadata } from "next";
import { ConsumerPaymentDetailPage } from "@/frontend/components/finance/ConsumerPages";

export const metadata: Metadata = { title: "Payment detail" };

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ edit?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  return <ConsumerPaymentDetailPage id={id} initialEdit={query.edit === "1"} />;
}
