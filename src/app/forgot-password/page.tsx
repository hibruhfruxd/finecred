import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/frontend/components/finance/AuthShell";
import { ForgotPasswordForm } from "@/frontend/components/finance/AuthForms";

export const metadata: Metadata = { title: "Recover demo access" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Demo recovery"
      title="Recover demo access"
      description="Enter a fictional demo email. The recovery response is intentionally generic."
      footer={<>Remembered your demo? <Link href="/login">Return to sign in</Link></>}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
