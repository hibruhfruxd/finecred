"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ClientApiError, apiRequest } from "@/frontend/lib/api";
import { roleHome } from "@/frontend/lib/roles";
import { quickLoginSchema } from "@/models/validation/auth";
import type { LoginResponseDto } from "@/models/api";

export function HomeQuickLogin() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const validation = quickLoginSchema.safeParse({ name, email });
    if (!validation.success) {
      setError("Enter your name and a valid email address.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await apiRequest<LoginResponseDto>("/api/auth/quick-login", {
        method: "POST",
        body: JSON.stringify(validation.data),
      });
      router.replace(roleHome(result.user.role));
      router.refresh();
    } catch (caught) {
      setError(
        caught instanceof ClientApiError && caught.status === 403
          ? "This account has been disabled. Please contact the workspace administrator."
          : "We couldn't sign you in with those details. Please try again.",
      );
      setSubmitting(false);
    }
  }

  return (
    <form id="quick-login" className="pdf-hero-login" onSubmit={submit} noValidate>
      <div className="pdf-hero-login-fields">
        <label className="pdf-field">
          <span>Name</span>
          <input
            className="pdf-input"
            type="text"
            name="name"
            autoComplete="name"
            placeholder="Aarav Mehta"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            disabled={submitting}
          />
        </label>
        <label className="pdf-field">
          <span>Email</span>
          <input
            className="pdf-input"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            disabled={submitting}
          />
        </label>
      </div>
      {error ? <div className="pdf-alert pdf-alert-danger" role="alert"><span><strong>{error}</strong></span></div> : null}
      <div className="pdf-hero-actions">
        <button className="pdf-btn pdf-btn-primary pdf-btn-lg" type="submit" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in & view dashboard"}
        </button>
        <a href="#how-it-works" className="pdf-btn pdf-btn-secondary pdf-btn-lg">See how it works</a>
      </div>
    </form>
  );
}
