"use client";

import { Eye, EyeOff, KeyRound, Loader2, LogIn, Mail, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ClientApiError, apiRequest } from "@/frontend/lib/api";
import { DEMO_ACCOUNTS } from "@/models/demo-accounts";
import { loginSchema } from "@/models/validation/auth";
import { zodFieldErrors } from "@/models/validation/zod-errors";
import type { LoginResponseDto } from "@/models/api";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string | null>(null);

  function useDemoAccount(demoEmail: string, demoPassword: string) {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setErrors({});
    setServerError("");
    setSelectedDemo(demoEmail);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setServerError("");

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      setErrors(zodFieldErrors(validation.error));
      return;
    }

    setErrors({});
    setSubmitting(true);
    try {
      await apiRequest<LoginResponseDto>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: validation.data.email,
          password: validation.data.password,
        }),
      });
      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      if (error instanceof ClientApiError) {
        if (Object.keys(error.fields).length > 0) {
          setErrors(error.fields);
        }
        setServerError(error.message);
      } else {
        setServerError("The demo sign-in could not be completed. Please try again.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="login-form-stack">
      <div className="demo-notice">
        <ShieldAlert size={17} aria-hidden="true" />
        <div>
          <strong>Demo-only access</strong>
          <p>
            These are fictional accounts. Never enter real customer credentials or financial
            information.
          </p>
        </div>
      </div>

      <form className="login-form" onSubmit={handleSubmit} noValidate>
        <div className={`field ${errors.email ? "field-invalid" : ""}`}>
          <label htmlFor="email">Email address</label>
          <div className="input-with-icon">
            <Mail size={17} aria-hidden="true" />
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="username"
              placeholder="demo@fincred.app"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSelectedDemo(null);
              }}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              disabled={submitting}
            />
          </div>
          {errors.email ? (
            <p className="field-error" id="email-error" role="alert">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className={`field ${errors.password ? "field-invalid" : ""}`}>
          <label htmlFor="password">Password</label>
          <div className="input-with-icon input-with-action">
            <KeyRound size={17} aria-hidden="true" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your demo password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setSelectedDemo(null);
              }}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              disabled={submitting}
            />
            <button
              type="button"
              className="input-action"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              disabled={submitting}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          {errors.password ? (
            <p className="field-error" id="password-error" role="alert">
              {errors.password}
            </p>
          ) : null}
        </div>

        {serverError ? (
          <div className="alert alert-error" role="alert">
            <ShieldAlert size={17} aria-hidden="true" />
            <p>{serverError}</p>
          </div>
        ) : null}

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="spin" size={17} aria-hidden="true" />
              Signing in…
            </>
          ) : (
            <>
              <LogIn size={17} aria-hidden="true" />
              Sign in to demo
            </>
          )}
        </button>
      </form>

      <div className="demo-accounts">
        <div className="demo-accounts-heading">
          <div>
            <p className="eyebrow">Demo credentials</p>
            <h3>Choose an account</h3>
          </div>
          <span className="badge badge-neutral">Fictional</span>
        </div>

        <div className="demo-account-list">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              type="button"
              key={account.email}
              className={`demo-account ${
                selectedDemo === account.email ? "demo-account-selected" : ""
              }`}
              onClick={() => useDemoAccount(account.email, account.password)}
              disabled={submitting}
              aria-pressed={selectedDemo === account.email}
            >
              <span className="demo-account-top">
                <span className="demo-account-name">{account.fullName}</span>
                <span className="demo-account-badge">{account.label}</span>
              </span>
              <span className="demo-account-desc">{account.description}</span>
              <span className="demo-credential-row">
                <span className="demo-credential">
                  <span>Email</span>
                  <code>{account.email}</code>
                </span>
                <span className="demo-credential">
                  <span>Password</span>
                  <code>{account.password}</code>
                </span>
              </span>
              <span className="demo-account-action">
                {selectedDemo === account.email ? "Credentials filled" : "Use this demo account"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
