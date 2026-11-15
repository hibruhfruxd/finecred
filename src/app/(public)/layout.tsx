import { PublicShell } from "@/frontend/components/finance/PublicShell";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <PublicShell>{children}</PublicShell>;
}
