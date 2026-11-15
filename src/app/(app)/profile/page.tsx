import type { Metadata } from "next";
import { ConsumerProfilePage } from "@/frontend/components/finance/ConsumerPages";

export const metadata: Metadata = { title: "Profile" };

export default function Page() {
  return <ConsumerProfilePage />;
}
