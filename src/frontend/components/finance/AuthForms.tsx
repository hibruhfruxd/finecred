"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { FcLogo } from "@/frontend/components/finance/PublicShell";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("Demo Consumer");
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [checked, setChecked] = useState(true);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 8 || password !== confirm || !checked) {
      setError("Complete all fields and acknowledge that this is synthetic data.");
      return;
    }
    window.localStorage.setItem("finance-credibility-registered-demo", JSON.stringify({ name, email, createdAt: new Date().toISOString() }));
    router.push("/login");
  }

  return (
    <form className="pdf-auth-card" onSubmit={submit} noValidate style={{ minHeight: 520 }}>
      <FcLogo size="sm" />
      <h2>Create account</h2>
      <label className="pdf-field"><span>Name</span><input className="pdf-input" value={name} onChange={(event) => setName(event.target.value)} required /></label>
      <label className="pdf-field"><span>Email</span><input className="pdf-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label className="pdf-field"><span>Password</span><input className="pdf-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      <label className="pdf-field"><span>Confirm password</span><input className={`pdf-input ${confirm && confirm !== password ? "pdf-input-error" : ""}`} type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} required /></label>
      <label style={{ display: "flex", gap: 8, alignItems: "center", color: "var(--muted)", fontSize: 10 }}>
        <input type="checkbox" checked={checked} onChange={(event) => setChecked(event.target.checked)} />
        I understand this is a synthetic-data demo.
      </label>
      {error ? <div className="pdf-alert pdf-alert-danger"><span><strong>{error}</strong></span></div> : null}
      <button className="pdf-btn pdf-btn-primary" style={{ width: "100%", minHeight: 44 }} type="submit">Create account</button>
      <div className="pdf-auth-card-footer" style={{ textAlign: "center" }}>Already registered? <Link className="pdf-auth-link" href="/login">Sign in</Link></div>
      <div className="pdf-auth-card-footer">Email verification & OTP are simulated in this demo.</div>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("demo@example.com");
  const [sent, setSent] = useState(false);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <form className="pdf-auth-card" onSubmit={submit} noValidate style={{ minHeight: 310 }}>
      <FcLogo size="sm" />
      <h2>Forgot password</h2>
      <p>Enter your email. If an account exists, we&apos;ll send a reset link.</p>
      <label className="pdf-field"><span>Email</span><input className="pdf-input" type="email" autoFocus value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <button className="pdf-btn pdf-btn-primary" style={{ width: "100%", minHeight: 44 }} type="submit">{sent ? "Reset link sent" : "Send reset link"}</button>
      <div className="pdf-auth-card-footer" style={{ textAlign: "center" }}>Back to <Link className="pdf-auth-link" href="/login">Sign in</Link></div>
      <div className="pdf-auth-card-footer">Email verification & OTP are simulated in this demo.</div>
    </form>
  );
}

export function ResetPasswordForm() {
  const [password, setPassword] = useState("demo-pass-1");
  const [confirm, setConfirm] = useState("");
  const strength = useMemo(() => Math.min(100, Math.max(20, password.length * 8 + (/[^A-Za-z0-9]/.test(password) ? 12 : 0))), [password]);
  const valid = password.length >= 8 && password === confirm;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!valid) return;
    window.localStorage.setItem("finance-credibility-reset-demo", new Date().toISOString());
  }

  return (
    <form className="pdf-auth-card" onSubmit={submit} noValidate style={{ minHeight: 315 }}>
      <FcLogo size="sm" />
      <h2>Reset password</h2>
      <label className="pdf-field"><span>New password</span><input className="pdf-input" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <div className="pdf-score-track" style={{ height: 4, marginTop: -4 }}><span style={{ width: `${strength}%`, background: strength > 75 ? "var(--mint)" : "var(--amber)", boxShadow: "none" }} /></div>
      <p className="pdf-small">Strength: good — add a symbol for strong.</p>
      <label className="pdf-field"><span>Confirm password</span><input className="pdf-input" type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="••••••••••" /></label>
      <button className="pdf-btn pdf-btn-primary" style={{ width: "100%", minHeight: 44 }} type="submit" disabled={!valid}>Reset password</button>
      <div className="pdf-auth-card-footer">Email verification & OTP are simulated in this demo.</div>
    </form>
  );
}

export function OnboardingFlow() {
  return (
    <div className="pdf-public-container" style={{ padding: "80px 0" }}>
      <div className="pdf-card pdf-card-lg">
        <span className="pdf-pill pdf-pill-info"><Check size={12} /> Demo ready</span>
        <h1 style={{ margin: "16px 0" }}>Your synthetic workspace is ready.</h1>
        <p>Use consumer, lender or administrator demo accounts to explore the design.</p>
        <Link href="/login" className="pdf-btn pdf-btn-primary" style={{ marginTop: 18 }}>Choose a workspace</Link>
      </div>
    </div>
  );
}
