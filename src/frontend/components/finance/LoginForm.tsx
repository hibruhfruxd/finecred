"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ClientApiError, apiRequest } from "@/frontend/lib/api";
import { roleHome } from "@/frontend/lib/roles";
import { FcLogo } from "@/frontend/components/finance/PublicShell";
import { loginSchema } from "@/models/validation/auth";
import type { LoginResponseDto } from "@/models/api";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError("We couldn't sign you in with those details. Please try again.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await apiRequest<LoginResponseDto>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(validation.data),
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
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
        <Link className="pdf-auth-link" href="/forgot-password">Forgot password</Link>
        <span className="pdf-small">New here? <Link className="pdf-auth-link" href="/register">Register</Link></span>
      </div>
      <div className="pdf-auth-card-footer">Email verification & OTP are simulated in this demo.</div>
    </form>
  );
}
