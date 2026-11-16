import { AppShell } from "@/frontend/components/finance/AppShell";
import { AuthProvider } from "@/frontend/providers/AuthProvider";
import { DemoDataProvider } from "@/frontend/lib/demo-data";
import { getDemoSessionUser } from "@/frontend/lib/demo-session";

export default function ConsumerLayout({ children }: { children: React.ReactNode }) {
  const session = getDemoSessionUser("consumer");

  return (
    <AuthProvider initialUser={session}>
      <DemoDataProvider>
        <AppShell>{children}</AppShell>
      </DemoDataProvider>
    </AuthProvider>
  );
}
