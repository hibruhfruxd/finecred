"use client";

import Link from "next/link";
import type { ReactNode } from "react";

function PublicArticle({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="pdf-public-section" style={{ minHeight: "72vh", paddingTop: 72 }}>
      <div className="pdf-public-container">
        <p className="pdf-eyebrow">{eyebrow}</p>
        <h1 className="pdf-section-title" style={{ maxWidth: 900 }}>{title}</h1>
        <div className="pdf-card pdf-card-lg" style={{ marginTop: 24, maxWidth: 900, lineHeight: 1.75 }}>
          {children}
        </div>
      </div>
    </section>
  );
}

export function LandingPage() {
  return (
    <>
      <section className="pdf-public-container pdf-hero">
        <div>
          <p className="pdf-eyebrow">Synthetic data · Experimental assessment</p>
          <h1>Your financial responsibility deserves recognition.</h1>
          <p className="pdf-hero-copy">
            Finance Credibility turns everyday payment consistency — rent, utilities, insurance — into a transparent, explainable picture that you control and choose to share.
          </p>
          <div className="pdf-hero-actions">
            <Link href="/explore" className="pdf-btn pdf-btn-primary pdf-btn-lg">Explore dashboard</Link>
            <Link href="#how-it-works" className="pdf-btn pdf-btn-secondary pdf-btn-lg">See how it works</Link>
          </div>
          <p className="pdf-hero-note">No real accounts. No identity documents. Demo records only.</p>
        </div>

        <div className="pdf-illustrative-card" aria-label="Illustrative financial credibility preview">
          <div className="pdf-illustrative-head">
            <span>Illustrative credibility</span>
            <span className="pdf-pill pdf-pill-success"><span className="pdf-pill-dot" />+12 this month</span>
          </div>
          <div className="pdf-illustrative-number">782 <small>/ 900</small></div>
          <div className="pdf-score-track"><span /></div>
          <div className="pdf-illustrative-stats">
            <div className="pdf-illustrative-stat"><span>On-time</span><strong>94%</strong></div>
            <div className="pdf-illustrative-stat"><span>Records</span><strong>72</strong></div>
            <div className="pdf-illustrative-stat"><span>Coverage</span><strong>12 mo</strong></div>
          </div>
          <div className="pdf-progress-row">
            <div className="pdf-progress-head"><span>Payment consistency</span><strong>92/100</strong></div>
            <div className="pdf-progress-track"><div className="pdf-progress-fill green" style={{ width: "92%" }} /></div>
          </div>
          <div className="pdf-illustrative-foot">Synthetic data only. Experimental assessment — not a credit bureau score.</div>
        </div>
      </section>

      <section id="how-it-works" className="pdf-public-section">
        <div className="pdf-public-container">
          <p className="pdf-eyebrow">How it works</p>
          <h2 className="pdf-section-title">Three quiet steps. Nothing hidden.</h2>
          <div className="pdf-three-step">
            {[
              ["01", "Record payments", "Add recurring bills like rent and utilities. Due and paid dates are all we need — never card numbers or bank logins."],
              ["02", "Understand patterns", "See punctuality, consistency and coverage broken into nine indicators, each with its weight and plain-language explanation."],
              ["03", "Control sharing", "Decide which organization can view your assessment. Withdraw consent at any time and access ends immediately."],
            ].map(([number, title, copy]) => (
              <article className="pdf-step-card" key={number}>
                <span className="pdf-step-number">{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="pdf-public-section">
        <div className="pdf-public-container">
          <p className="pdf-eyebrow">Features</p>
          <h2 className="pdf-section-title">Built to be understood, not just viewed.</h2>
          <div className="pdf-feature-row">
            <article className="pdf-feature-card"><h3>Explainable score</h3><p>Nine weighted indicators with reason codes. Every point has a visible cause.</p></article>
            <article className="pdf-feature-card"><h3>Privacy-first consent</h3><p>Purpose-bound sharing with a recorded history. Withdrawal is one action and immediate.</p></article>
            <article className="pdf-feature-card"><h3>Accessible by design</h3><p>Keyboard-first, visible focus, reduced-motion support, and table alternatives for every chart.</p></article>
          </div>
        </div>
      </section>

      <section id="for-lenders" className="pdf-public-section">
        <div className="pdf-public-container">
          <p className="pdf-eyebrow">For lenders</p>
          <h2 className="pdf-section-title">Context for review, never a verdict.</h2>
          <p className="pdf-section-copy">Authorized lender teams see only what a consumer has chosen to share, with every access recorded. The workspace supports review and documentation only.</p>
          <div className="pdf-lender-row">
            <div className="pdf-feature-card" style={{ gridColumn: "span 1" }}><h3>Authorized applicants</h3><p>Only applicants who granted active sharing consent appear.</p></div>
            <div className="pdf-feature-card"><h3>Transparent context</h3><p>Indicators, coverage and data-quality flags shown together.</p></div>
            <div className="pdf-feature-card"><h3>No automated decisions</h3><p>No approvals or rejections are generated by FC.</p></div>
          </div>
        </div>
      </section>

      <section id="trust" className="pdf-public-section">
        <div className="pdf-public-container">
          <p className="pdf-eyebrow">Trust</p>
          <h2 className="pdf-section-title">Clear about what this is — and is not.</h2>
          <div className="pdf-trust-grid">
            <article className="pdf-feature-card"><span className="pdf-pill pdf-pill-gold">Synthetic data</span><p style={{ marginTop: 14 }}>Every record is generated. No real people, accounts or identities.</p></article>
            <article className="pdf-feature-card"><span className="pdf-pill pdf-pill-info">300–900 range</span><p style={{ marginTop: 14 }}>An illustrative scale for explanation, not a bureau scale.</p></article>
            <article className="pdf-feature-card"><span className="pdf-pill" style={{ background: "#fff", color: "#08080a", borderColor: "#fff" }}>FC-DEMO-1.0</span><p style={{ marginTop: 14 }}>Versioned model. Historical assessments are never silently rewritten.</p></article>
            <article className="pdf-feature-card"><span className="pdf-pill pdf-pill-danger">No loan decisions</span><p style={{ marginTop: 14 }}>Not a default prediction or lending-risk model.</p></article>
          </div>
        </div>
      </section>
    </>
  );
}

export function AccessibilityPage() {
  return <PublicArticle eyebrow="Accessibility" title="Accessible by design."><p>Keyboard-first controls, visible focus rings, reduced-motion support and table alternatives accompany every chart. Status never relies on colour alone.</p></PublicArticle>;
}
export function MethodologyPage() {
  return <PublicArticle eyebrow="Methodology" title="Explainable, versioned, illustrative."><p>FC-DEMO-1.0 combines nine weighted indicators. Scores use an illustrative 300–900 range and are never silently rewritten. The model is not validated for lending decisions.</p></PublicArticle>;
}
export function HowItWorksPage() {
  return <PublicArticle eyebrow="Methodology" title="Three quiet steps. Nothing hidden."><p>Record due and paid dates. FC explains punctuality, consistency, obligation management and coverage in plain language. Missing records remain unknown, not missed.</p></PublicArticle>;
}
export function FeaturesPage() {
  return <PublicArticle eyebrow="Features" title="Built to be understood, not just viewed."><p>Explainable score, privacy-first consent and accessible by design. Every number links to a visible cause.</p></PublicArticle>;
}
export function ForLendersPage() {
  return <PublicArticle eyebrow="For lenders" title="Context for review, never a verdict."><p>Only authorized applicants with active sharing consent appear. No automated approval or rejection is generated.</p></PublicArticle>;
}
export function AboutPage() {
  return <PublicArticle eyebrow="About" title="A calm interface for financial responsibility."><p>Finance Credibility is an experimental synthetic-data demonstration, not a credit bureau or lending service.</p></PublicArticle>;
}
export function ContactPage() {
  return <PublicArticle eyebrow="Contact" title="Talk to the demo team."><p>This interface is a design prototype. Contact requests are not submitted to a real support service.</p></PublicArticle>;
}
export function FaqPage() {
  return <PublicArticle eyebrow="FAQ" title="Questions worth asking."><p>No, this is not a credit score. Missing records are unknown. Lender access requires explicit consent and can be withdrawn immediately.</p></PublicArticle>;
}
export function PrivacyPage() {
  return <PublicArticle eyebrow="Privacy" title="Privacy notice"><p>The demo stores only synthetic records, preferences and consent choices. It does not request bank accounts, credentials, government identifiers or bureau data.</p></PublicArticle>;
}
export function TermsPage() {
  return <PublicArticle eyebrow="Terms" title="Demo terms"><p>Use this prototype with synthetic data only. It does not provide financial advice, credit reporting, eligibility or lending decisions.</p></PublicArticle>;
}
export function DisclaimerPage() {
  return <PublicArticle eyebrow="Disclaimer" title="Synthetic data and assessment disclaimer"><p>All people, payments, scores, assessments, reports and audit events are fictional. This is not a credit bureau score, a risk prediction or an approval decision.</p></PublicArticle>;
}
