import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/frontend/components/finance/AuthShell";
import { LoginForm } from "@/frontend/components/finance/LoginForm";
import { getServerSession } from "@/backend/auth/server-session";
import { roleHome } from "@/frontend/lib/roles";

export const metadata: Metadata = {
  title: "Demo sign in",
};

export default async function LoginPage() {
  const session = await getServerSession();
  if (session) redirect(roleHome(session.role));

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to Finance Credibility"
      description="Choose one of the fictional workspaces below or enter the demo credentials you were given."
    >
      <LoginForm />
    </AuthShell>
  );
}
