"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ClientApiError, apiRequest } from "@/frontend/lib/api";
import { roleHome } from "@/frontend/lib/roles";
import { FcLogo } from "@/frontend/components/finance/PublicShell";
import { DEMO_ACCOUNTS, ROLE_LABELS, type DemoRole } from "@/models/demo-accounts";
import { loginSchema } from "@/models/validation/auth";
import type { LoginResponseDto } from "@/models/api";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function signIn(nextEmail: string, nextPassword: string) {
    setError("");
    setSubmitting(true);
    try {
      const result = await apiRequest<LoginResponseDto>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: nextEmail, password: nextPassword }),
      });
      router.replace(roleHome(result.user.role));
      router.refresh();
    } catch (caught) {
      setError("We couldn't sign you in with those details. Please try again.");
      setSubmitting(false);
      if (caught instanceof ClientApiError && caught.status === 403) {
        setError("This account has been disabled. Please contact the workspace administrator.");
      }
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError("We couldn't sign you in with those details. Please try again.");
      return;
    }
    await signIn(validation.data.email, validation.data.password);
  }

  async function quickLogin(role: DemoRole) {
    const account = DEMO_ACCOUNTS.find((item) => item.role === role);
    if (!account) return;
    setEmail(account.email);
    setPassword(account.password);
    await signIn(account.email, account.password);
  }

  return (
    <form className="pdf-auth-card" onSubmit={submit} noValidate style={{ minHeight: 418 }}>
      <FcLogo size="sm" />
      <h2>Sign in</h2>
      <label className="pdf-field">
        <span>Email</span>
        <input className="pdf-input" type="email" name="email" autoComplete="username" placeholder="demo@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required disabled={submitting} />
      </label>
      <label className="pdf-field">
        <span>Password</span>
        <input className="pdf-input" type="password" name="password" autoComplete="current-password" placeholder="••••••••••" value={password} onChange={(event) => setPassword(event.target.value)} required disabled={submitting} />
      </label>
      {error ? <div className="pdf-alert pdf-alert-danger" role="alert"><span><strong>{error}</strong></span></div> : null}
      <button className="pdf-btn pdf-btn-primary" style={{ width: "100%", minHeight: 48 }} type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</button>
      <div className="pdf-quick-login" aria-label="One-click demo login">
        <span className="pdf-quick-login-label">One-click demo login</span>
        <div className="pdf-quick-login-actions">
          {(["consumer", "lender", "admin"] as DemoRole[]).map((role) => (
            <button type="button" key={role} onClick={() => void quickLogin(role)} disabled={submitting}>
              {ROLE_LABELS[role]}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <Link className="pdf-auth-link" href="/forgot-password">Forgot password</Link>
        <span className="pdf-small">New here? <Link className="pdf-auth-link" href="/register">Register</Link></span>
      </div>
      <div className="pdf-auth-card-footer">Email verification & OTP are simulated in this demo.</div>
    </form>
  );
}
