import type { Metadata } from "next";
import { ContactPage } from "@/frontend/components/finance/PublicPages";

export const metadata: Metadata = { title: "Contact" };

export default function Page() {
  return <ContactPage />;
}
