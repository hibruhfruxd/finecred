import { redirect } from "next/navigation";
import { getServerSession } from "@/backend/auth/server-session";
import { AppShell } from "@/frontend/components/finance/AppShell";
import { AuthProvider } from "@/frontend/providers/AuthProvider";
import { DemoDataProvider } from "@/frontend/lib/demo-data";
import { roleHome } from "@/frontend/lib/roles";

export default async function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/login");
  if (session.role !== "consumer") redirect(roleHome(session.role));

  return (
    <AuthProvider initialUser={session}>
      <DemoDataProvider>
        <AppShell>{children}</AppShell>
      </DemoDataProvider>
    </AuthProvider>
  );
}
