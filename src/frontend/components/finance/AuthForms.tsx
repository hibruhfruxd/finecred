"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FcLogo } from "@/frontend/components/finance/PublicShell";
import { SYNTHETIC_BANNER } from "@/frontend/lib/demo-data";

function Field({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  autoComplete,
  error,
  icon,
}: {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  error?: string;
  icon?: React.ReactNode;
}) {
  return (
    <label className="fc-field">
      <span>{label}</span>
      <div className={icon ? "fc-input-icon" : undefined}>
        {icon}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
        />
      </div>
      {error ? <span className="fc-field-error">{error}</span> : null}
    </label>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Enter a display name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "Enter a valid demo email address.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (!consent) next.consent = "Record synthetic-data consent to continue.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitting(true);
    window.setTimeout(() => {
      setSubmitting(false);
      setDone(true);
    }, 650);
  }

  if (done) {
    return (
      <div className="fc-success-state">
        <span className="fc-success-icon"><CheckCircle2 size={26} /></span>
        <h2>Synthetic account prepared</h2>
        <p>
          Registration is simulated in this prototype. No account or email was created. Use one of
          the seeded demo workspaces to continue.
        </p>
        <button type="button" className="fc-btn fc-btn-primary" onClick={() => router.push("/login")}>
          Continue to demo sign in <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <form className="fc-form" onSubmit={submit} noValidate>
      <div className="fc-form-grid">
        <Field label="Full name" placeholder="Fictional name" value={name} onChange={setName} autoComplete="name" error={errors.name} icon={<UserRound size={17} />} />
        <Field label="Demo email" type="email" placeholder="you@fincred.demo" value={email} onChange={setEmail} autoComplete="email" error={errors.email} icon={<Mail size={17} />} />
      </div>
      <label className="fc-field">
        <span>Password</span>
        <div className="fc-input-icon fc-input-action">
          <KeyRound size={17} />
          <input
            type={show ? "text" : "password"}
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            aria-invalid={Boolean(errors.password)}
          />
          <button type="button" className="fc-input-action-btn" onClick={() => setShow((value) => !value)} aria-label={show ? "Hide password" : "Show password"}>
            {show ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        </div>
        {errors.password ? <span className="fc-field-error">{errors.password}</span> : null}
      </label>
      <label className="fc-check fc-check-block">
        <input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} />
        <span>I understand this is a synthetic prototype and consent to fictional assessment processing.</span>
      </label>
      {errors.consent ? <span className="fc-field-error">{errors.consent}</span> : null}
      <div className="fc-note fc-note-amber">
        <ShieldCheck size={18} />
        <p>No real identities, bank accounts, payment providers, or credit bureau data are connected.</p>
      </div>
      <button type="submit" className="fc-btn fc-btn-primary fc-btn-block" disabled={submitting}>
        {submitting ? <Loader2 size={17} className="fc-spin" /> : <Sparkles size={17} />}
        {submitting ? "Preparing demo…" : "Create synthetic account"}
      </button>
      <div className="fc-auth-footer">
        Already have demo access? <Link href="/login">Sign in</Link>
      </div>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid demo email address.");
      return;
    }
    setError("");
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="fc-success-state">
        <span className="fc-success-icon"><Mail size={26} /></span>
        <h2>Check the demo inbox</h2>
        <p>
          If this were a live environment, a single-use recovery link would be sent. Email delivery
          is simulated and no message was sent.
        </p>
        <Link href="/reset-password" className="fc-btn fc-btn-primary">
          Open the demo reset screen <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <form className="fc-form" onSubmit={submit} noValidate>
      <Field label="Demo email address" type="email" placeholder="consumer@fincred.demo" value={email} onChange={setEmail} autoComplete="email" icon={<Mail size={17} />} error={error} />
      <div className="fc-note fc-note-blue">
        <ShieldCheck size={18} />
        <p>Recovery responses are intentionally generic so demo accounts cannot be enumerated.</p>
      </div>
      <button type="submit" className="fc-btn fc-btn-primary fc-btn-block">
        Request demo recovery link <ArrowRight size={16} />
      </button>
      <Link href="/login" className="fc-back-link"><ArrowLeft size={15} /> Back to sign in</Link>
    </form>
  );
}

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The passwords do not match.");
      return;
    }
    setError("");
    setDone(true);
  }

  if (done) {
    return (
      <div className="fc-success-state">
        <span className="fc-success-icon"><Check size={26} /></span>
        <h2>Demo password updated</h2>
        <p>This change is local to the simulated reset flow and does not modify a live credential.</p>
        <Link href="/login" className="fc-btn fc-btn-primary">Return to sign in</Link>
      </div>
    );
  }

  return (
    <form className="fc-form" onSubmit={submit} noValidate>
      <Field label="New password" type="password" placeholder="At least 8 characters" value={password} onChange={setPassword} autoComplete="new-password" icon={<KeyRound size={17} />} />
      <Field label="Confirm new password" type="password" placeholder="Repeat password" value={confirm} onChange={setConfirm} autoComplete="new-password" icon={<KeyRound size={17} />} error={error} />
      <button type="submit" className="fc-btn fc-btn-primary fc-btn-block">Update demo password</button>
      <Link href="/login" className="fc-back-link"><ArrowLeft size={15} /> Back to sign in</Link>
    </form>
  );
}

const ONBOARDING_STEPS = [
  { title: "Welcome", copy: "A transparent look at payment responsibility." },
  { title: "Profile", copy: "Set a fictional display profile." },
  { title: "Consent", copy: "Choose assessment processing." },
  { title: "Introduction", copy: "Understand the score boundaries." },
  { title: "First payment", copy: "Add one synthetic record." },
];

export function OnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("Demo Consumer 001");
  const [purpose, setPurpose] = useState("Personal financial awareness");
  const [processing, setProcessing] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [payment, setPayment] = useState("18,000");

  function finish() {
    router.push("/login");
  }

  return (
    <main className="fc-onboarding">
      <div className="fc-synthetic-strip">{SYNTHETIC_BANNER}</div>
      <div className="fc-onboarding-topbar">
        <Link href="/"><FcLogo /></Link>
        <Link href="/login" className="fc-btn fc-btn-ghost fc-btn-sm">Skip to demo sign in</Link>
      </div>
      <div className="fc-onboarding-shell">
        <aside className="fc-onboarding-steps">
          <p className="fc-eyebrow">Demo onboarding</p>
          <h1>Five short steps to a visible payment story.</h1>
          <ol>
            {ONBOARDING_STEPS.map((item, index) => (
              <li key={item.title} className={index === step ? "active" : index < step ? "complete" : ""}>
                <span>{index < step ? <Check size={14} /> : index + 1}</span>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </aside>
        <section className="fc-onboarding-panel">
          <div className="fc-onboarding-progress">
            <span>Step {step + 1} of {ONBOARDING_STEPS.length}</span>
            <div><span style={{ width: `${((step + 1) / ONBOARDING_STEPS.length) * 100}%` }} /></div>
          </div>
          {step === 0 ? (
            <div className="fc-onboarding-content">
              <span className="fc-onboarding-icon"><Sparkles size={26} /></span>
              <h2>Financial responsibility, made visible.</h2>
              <p>
                This demonstration uses fictional payments to show how consistency and punctuality
                can be explained transparently. It is not a bureau score and cannot approve a loan.
              </p>
              <div className="fc-onboarding-preview">
                <div><strong>782</strong><span>Illustrative score</span></div>
                <div><strong>94%</strong><span>On-time payments</span></div>
                <div><strong>72</strong><span>Synthetic records</span></div>
              </div>
            </div>
          ) : null}
          {step === 1 ? (
            <div className="fc-onboarding-content">
              <h2>Create a fictional profile</h2>
              <p>These values stay in the demo and are never used for real identity verification.</p>
              <label className="fc-field"><span>Display name</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label>
              <label className="fc-field"><span>Purpose</span><select value={purpose} onChange={(event) => setPurpose(event.target.value)}><option>Personal financial awareness</option><option>Exploring lender sharing</option><option>Research and product feedback</option></select></label>
            </div>
          ) : null}
          {step === 2 ? (
            <div className="fc-onboarding-content">
              <h2>Choose explicit consent</h2>
              <p>Processing and lender sharing are separate choices. You can withdraw either later.</p>
              <label className="fc-consent-option">
                <input type="checkbox" checked={processing} onChange={(event) => setProcessing(event.target.checked)} />
                <span><strong>Assessment processing</strong><small>Generate illustrative assessments from synthetic records.</small></span>
              </label>
              <label className="fc-consent-option">
                <input type="checkbox" checked={sharing} onChange={(event) => setSharing(event.target.checked)} />
                <span><strong>Share with Demo Lender A</strong><small>Optional. No real organization receives this data.</small></span>
              </label>
            </div>
          ) : null}
          {step === 3 ? (
            <div className="fc-onboarding-content">
              <h2>Understand the boundaries</h2>
              <div className="fc-note fc-note-blue"><ShieldCheck size={18} /><p>The score comes only from self-recorded synthetic payments. Missing records are unknown, not missed.</p></div>
              <div className="fc-boundary-grid">
                <div><strong>Coverage</strong><span>12 months · 72 records · 4 categories</span></div>
                <div><strong>Model</strong><span>FC-DEMO-1.0 · experimental · versioned</span></div>
                <div><strong>Not used for</strong><span>Loan approval, default prediction, bureau scoring</span></div>
              </div>
            </div>
          ) : null}
          {step === 4 ? (
            <div className="fc-onboarding-content">
              <h2>Add your first synthetic payment</h2>
              <p>Choose any fictional amount. The demo will use it to show a derived payment status.</p>
              <label className="fc-field"><span>Rent amount (INR)</span><input value={payment} onChange={(event) => setPayment(event.target.value)} inputMode="numeric" /></label>
              <div className="fc-derived-card">
                <span>Derived status</span>
                <strong>Paid on time</strong>
                <p>Due 05 Nov 2026 · paid 03 Nov 2026 · synthetic only</p>
              </div>
            </div>
          ) : null}
          <div className="fc-onboarding-actions">
            {step > 0 ? (
              <button type="button" className="fc-btn fc-btn-secondary" onClick={() => setStep((value) => value - 1)}>
                <ArrowLeft size={16} /> Back
              </button>
            ) : <span />}
            {step < ONBOARDING_STEPS.length - 1 ? (
              <button type="button" className="fc-btn fc-btn-primary" onClick={() => setStep((value) => value + 1)}>
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button type="button" className="fc-btn fc-btn-primary" onClick={finish}>
                Finish and sign in <Check size={16} />
              </button>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
