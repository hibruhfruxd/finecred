import { AppShell } from "@/frontend/components/finance/AppShell";
import { AuthProvider } from "@/frontend/providers/AuthProvider";
import { DemoDataProvider } from "@/frontend/lib/demo-data";
import { getDemoSessionUser } from "@/frontend/lib/demo-session";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = getDemoSessionUser("admin");

  return (
    <AuthProvider initialUser={session}>
      <DemoDataProvider>
        <AppShell>{children}</AppShell>
      </DemoDataProvider>
    </AuthProvider>
  );
}
