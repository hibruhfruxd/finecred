import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/frontend/components/finance/AuthShell";
import { RegisterForm } from "@/frontend/components/finance/AuthForms";

export const metadata: Metadata = { title: "Create a demo account" };

export default function RegisterPage() {
  return (
    <AuthShell
      eyebrow="Synthetic onboarding"
      title="Create a demo account"
      description="Registration is simulated. Nothing is stored on a server and no email is sent."
      footer={<>Already have demo access? <Link href="/login">Sign in</Link></>}
    >
      <RegisterForm />
    </AuthShell>
  );
}
