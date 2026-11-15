"use client";

import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  ShieldAlert,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ClientApiError, apiRequest } from "@/frontend/lib/api";
import { roleHome } from "@/frontend/lib/roles";
import { DEMO_ACCOUNTS, ROLE_LABELS, type DemoRole } from "@/models/demo-accounts";
import { loginSchema } from "@/models/validation/auth";
import { zodFieldErrors } from "@/models/validation/zod-errors";
import type { LoginResponseDto } from "@/models/api";

const ROLE_ICONS: Record<DemoRole, typeof UserRound> = {
  consumer: UserRound,
  lender: Building2,
  admin: Wrench,
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  function pickAccount(accountEmail: string, accountPassword: string) {
    setEmail(accountEmail);
    setPassword(accountPassword);
    setSelected(accountEmail);
    setErrors({});
    setServerError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");
    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setErrors(zodFieldErrors(validation.error));
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const result = await apiRequest<LoginResponseDto>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(validation.data),
      });
      router.replace(roleHome(result.user.role));
      router.refresh();
    } catch (error) {
      if (error instanceof ClientApiError) {
        setErrors(error.fields);
        setServerError(error.message);
      } else {
        setServerError("The demo sign-in could not be completed. Please try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="fc-login-form-wrap">
      <div className="fc-note fc-note-blue fc-login-notice">
        <ShieldAlert size={18} />
        <div>
          <strong>Demo access only</strong>
          <p>These are fictional accounts. Never enter real identity or financial information.</p>
        </div>
      </div>

      <form className="fc-form fc-login-form" onSubmit={handleSubmit} noValidate>
        <label className="fc-field">
          <span>Email address</span>
          <div className="fc-input-icon">
            <Mail size={17} />
            <input
              type="email"
              name="email"
              autoComplete="username"
              inputMode="email"
              placeholder="consumer@fincred.demo"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSelected(null);
              }}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              disabled={submitting}
            />
          </div>
          {errors.email ? <span className="fc-field-error" id="login-email-error">{errors.email}</span> : null}
        </label>

        <label className="fc-field">
          <span>Password</span>
          <div className="fc-input-icon fc-input-action">
            <KeyRound size={17} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              placeholder="Enter your demo password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setSelected(null);
              }}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "login-password-error" : undefined}
              disabled={submitting}
            />
            <button
              type="button"
              className="fc-input-action-btn"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              disabled={submitting}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password ? <span className="fc-field-error" id="login-password-error">{errors.password}</span> : null}
        </label>

        <div className="fc-login-form-row">
          <label className="fc-check">
            <input type="checkbox" defaultChecked />
            <span>Remember this demo session</span>
          </label>
          <Link href="/forgot-password">Forgot password?</Link>
        </div>

        {serverError ? (
          <div className="fc-alert fc-alert-error" role="alert">
            <ShieldAlert size={17} />
            <p>{serverError}</p>
          </div>
        ) : null}

        <button type="submit" className="fc-btn fc-btn-primary fc-btn-block" disabled={submitting}>
          {submitting ? <Loader2 size={17} className="fc-spin" /> : <ShieldCheck size={17} />}
          {submitting ? "Signing in…" : "Sign in to demo"}
        </button>
      </form>

      <div className="fc-demo-divider"><span>or choose a demo workspace</span></div>

      <div className="fc-demo-accounts">
        {DEMO_ACCOUNTS.map((account) => {
          const Icon = ROLE_ICONS[account.role];
          const active = selected === account.email;
          return (
            <button
              type="button"
              key={account.email}
              className={`fc-demo-card ${active ? "active" : ""}`}
              onClick={() => pickAccount(account.email, account.password)}
              aria-pressed={active}
              disabled={submitting}
            >
              <span className="fc-demo-card-icon"><Icon size={19} /></span>
              <span className="fc-demo-card-main">
                <span className="fc-demo-card-top">
                  <strong>{ROLE_LABELS[account.role]}</strong>
                  <span className="fc-demo-card-tag">{account.label}</span>
                </span>
                <span className="fc-demo-card-name">{account.fullName}</span>
                <code>{account.email}</code>
                <span className="fc-demo-card-desc">{account.description}</span>
              </span>
              <ArrowRight size={17} className="fc-demo-card-arrow" />
            </button>
          );
        })}
      </div>

      <p className="fc-demo-password">
        All demo accounts use the password <code>Demo@123</code>. Select a card to fill the form.
      </p>

      <div className="fc-auth-footer fc-login-footer">
        New to the demo? <Link href="/register">Create a synthetic account</Link>
      </div>
    </div>
  );
}
