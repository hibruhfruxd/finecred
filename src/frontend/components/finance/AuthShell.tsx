import { ArrowLeft, CheckCircle2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { FcLogo } from "@/frontend/components/finance/PublicShell";
import { SYNTHETIC_BANNER } from "@/frontend/lib/demo-data";

const POINTS = [
  "Every value is a fictional design fixture.",
  "Coverage always appears beside the score.",
  "No bureau data, bank accounts, or loan decisions.",
];

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
  footer,
}: {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  footer?: ReactNode;
}) {
  return (
    <main className="fc-auth">
      <div className="fc-synthetic-strip">{SYNTHETIC_BANNER}</div>
      <div className="fc-auth-grid">
        <aside className="fc-auth-brand">
          <div className="fc-auth-brand-top">
            <Link href="/" aria-label="Finance Credibility home">
              <FcLogo light />
            </Link>
            <Link href="/" className="fc-auth-back">
              <ArrowLeft size={15} /> Back to website
            </Link>
          </div>
          <div className="fc-auth-brand-copy">
            <p className="fc-auth-kicker">Financial responsibility, made visible.</p>
            <h2>Understand the pattern behind everyday payments.</h2>
            <p>
              Explore a synthetic consumer, lender, or administrator workspace. Every score,
              applicant, and payment is fictional.
            </p>
            <div className="fc-auth-preview">
              <div className="fc-auth-preview-head">
                <span>Illustrative credibility</span>
                <span className="fc-auth-preview-badge">DEMO</span>
              </div>
              <div className="fc-auth-score-row">
                <strong>782</strong>
                <span>/ 900</span>
              </div>
              <div className="fc-auth-bars">
                <div><span style={{ width: "92%" }} /></div>
                <div><span style={{ width: "94%" }} /></div>
                <div><span style={{ width: "88%" }} /></div>
              </div>
              <p>12 months · 72 synthetic records · 94% on time</p>
            </div>
            <ul className="fc-auth-points">
              {POINTS.map((point) => (
                <li key={point}>
                  <CheckCircle2 size={16} />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="fc-auth-brand-foot">
            <ShieldCheck size={16} />
            <span>Experimental assessment · Not a credit bureau score</span>
          </div>
        </aside>
        <section className="fc-auth-panel">
          <div className="fc-auth-panel-inner">
            <div className="fc-auth-mobile-logo">
              <FcLogo />
            </div>
            <p className="fc-eyebrow">{eyebrow}</p>
            <h1>{title}</h1>
            <p className="fc-auth-description">{description}</p>
            {children}
            {footer ? <div className="fc-auth-footer">{footer}</div> : null}
          </div>
        </section>
      </div>
    </main>
  );
}
