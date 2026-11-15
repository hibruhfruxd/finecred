import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/frontend/components/finance/AuthShell";
import { ResetPasswordForm } from "@/frontend/components/finance/AuthForms";

export const metadata: Metadata = { title: "Reset demo password" };

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Single-use demo token"
      title="Reset your demo password"
      description="This screen simulates a single-use recovery link. It does not update a live credential."
      footer={<>Need a new demo account? <Link href="/register">Create one</Link></>}
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
