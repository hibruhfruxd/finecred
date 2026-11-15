import type { Metadata } from "next";
import { ConsumerNotificationsPage } from "@/frontend/components/finance/ConsumerPages";

export const metadata: Metadata = { title: "Notifications" };

export default function Page() {
  return <ConsumerNotificationsPage />;
}
