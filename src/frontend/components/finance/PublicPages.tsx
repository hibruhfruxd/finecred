"use client";

import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  Gauge,
  KeyRound,
  Layers3,
  LockKeyhole,
  Mail,
  ReceiptText,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  UserCheck,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { Badge, Card, InfoNote, ScoreGauge } from "@/frontend/components/finance/ui";
import { SYNTHETIC_BANNER } from "@/frontend/lib/demo-data";

function PublicPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="fc-public-page">
      <section className="fc-public-hero-small">
        <div className="fc-public-container">
          <p className="fc-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </section>
      <div className="fc-public-container fc-public-page-body">{children}</div>
    </div>
  );
}

const LANDING_STEPS = [
  {
    number: "01",
    title: "Record everyday payments",
    copy: "Add synthetic rent, utilities, internet, insurance, education, or subscription records.",
    icon: ReceiptText,
  },
  {
    number: "02",
    title: "See the observed pattern",
    copy: "Coverage, punctuality, delays, continuity, and obligation indicators are explained in plain language.",
    icon: Gauge,
  },
  {
    number: "03",
    title: "Share only with consent",
    copy: "Choose whether a fictional lender workspace may view your latest assessment and coverage.",
    icon: ShieldCheck,
  },
];

export function LandingPage() {
  return (
    <div className="fc-landing">
      <section className="fc-hero">
        <div className="fc-public-container fc-hero-grid">
          <div className="fc-hero-copy">
            <Badge tone="blue" dot>Built for everyday responsibility</Badge>
            <h1>Your Financial Responsibility Deserves <span>Recognition.</span></h1>
            <p>
              Discover a new way to understand your financial behaviour through everyday payment
              consistency — explained transparently, with synthetic data only.
            </p>
            <div className="fc-hero-actions">
              <Link href="/login" className="fc-btn fc-btn-primary fc-btn-lg">
                Get Started <ArrowRight size={17} />
              </Link>
              <Link href="/how-it-works" className="fc-btn fc-btn-secondary fc-btn-lg">
                Explore the demo
              </Link>
            </div>
            <p className="fc-hero-micro">
              <ShieldCheck size={15} /> No real accounts, bureau data, or lending decisions.
            </p>
          </div>
          <div className="fc-hero-visual">
            <div className="fc-hero-card">
              <div className="fc-hero-card-top">
                <div>
                  <span>Your financial snapshot</span>
                  <strong>Illustrative credibility</strong>
                </div>
                <Badge tone="green" dot>Demo</Badge>
              </div>
              <div className="fc-hero-score-row">
                <ScoreGauge score={782} size="md" caption="+12 vs previous" />
                <div className="fc-hero-stats">
                  <div><strong>94%</strong><span>On-time payments</span></div>
                  <div><strong>72</strong><span>Fictional records</span></div>
                  <div><strong>12 mo</strong><span>Observed coverage</span></div>
                </div>
              </div>
              <div className="fc-hero-trend">
                <div className="fc-hero-trend-head"><span>Six-month illustrative trend</span><span>Jun – Nov 2026</span></div>
                <div className="fc-hero-bars" aria-hidden="true">
                  {[42, 55, 51, 67, 62, 82].map((height, index) => (
                    <span key={index} style={{ height: `${height}%` }} />
                  ))}
                </div>
                <div className="fc-hero-months"><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span></div>
              </div>
            </div>
            <div className="fc-hero-float fc-hero-float-one">
              <CheckCircle2 size={16} /><span>November rent · paid on time</span>
            </div>
            <div className="fc-hero-float fc-hero-float-two">
              <LockKeyhole size={16} /><span>Coverage shown beside score</span>
            </div>
          </div>
        </div>
        <div className="fc-public-container fc-landing-disclaimer">
          <ShieldCheck size={15} />
          <span>Demo only. Synthetic data. Not a credit bureau score, validated risk prediction, or loan approval.</span>
        </div>
      </section>

      <section className="fc-public-section">
        <div className="fc-public-container">
          <div className="fc-section-heading">
            <p className="fc-eyebrow">Three product commitments</p>
            <h2>Transparent from the first record.</h2>
            <p>Every number has a visible source, a stated limitation, and a clear purpose.</p>
          </div>
          <div className="fc-three-grid">
            {LANDING_STEPS.map((step) => {
              const Icon = step.icon;
              return (
                <Card key={step.number} className="fc-feature-card">
                  <div className="fc-feature-top"><span className="fc-feature-icon"><Icon size={21} /></span><span className="fc-feature-number">{step.number}</span></div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                  <span className="fc-feature-link">Synthetic by design</span>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="fc-public-section fc-public-section-muted">
        <div className="fc-public-container fc-split-section">
          <div>
            <p className="fc-eyebrow">What the score is</p>
            <h2>A structured explanation, not a black box.</h2>
            <p className="fc-lead">
              The illustrative assessment combines ten transparent indicators from recorded
              synthetic payments. Coverage and model version appear with every score.
            </p>
            <div className="fc-check-list">
              {[
                "Punctuality and delays use recorded settlement dates.",
                "Missing records are unknown — never automatically treated as missed.",
                "Historical assessments remain immutable when the model version changes.",
                "No default prediction, bureau score, or loan approval is produced.",
              ].map((item) => (
                <div key={item}><Check size={16} /><span>{item}</span></div>
              ))}
            </div>
            <Link href="/how-it-works" className="fc-text-link">See how the assessment works <ArrowRight size={15} /></Link>
          </div>
          <Card className="fc-explanation-card">
            <div className="fc-explanation-head">
              <div><span>Illustrative assessment</span><strong>782 / 900</strong></div>
              <Badge tone="blue">FC-DEMO-1.0</Badge>
            </div>
            {[
              ["Payment punctuality", 94],
              ["Payment consistency", 92],
              ["Payment continuity", 92],
              ["Data coverage", 100],
              ["Expense stability", 86],
            ].map(([label, value]) => (
              <div className="fc-explanation-row" key={label}>
                <div><span>{label}</span><strong>{value}</strong></div>
                <div className="fc-mini-bar"><span style={{ width: `${value}%` }} /></div>
              </div>
            ))}
            <div className="fc-explanation-foot">
              <ShieldCheck size={16} />
              <span>Coverage: 12 months · 72 records · 4 categories</span>
            </div>
          </Card>
        </div>
      </section>

      <section className="fc-public-section">
        <div className="fc-public-container">
          <div className="fc-section-heading">
            <p className="fc-eyebrow">Built for both sides</p>
            <h2>Consumers stay in control. Lenders see only what is authorized.</h2>
          </div>
          <div className="fc-two-grid">
            <Card className="fc-audience-card">
              <span className="fc-audience-icon fc-tone-blue"><UserCheck size={22} /></span>
              <h3>For consumers</h3>
              <p>Record payments, understand patterns, and decide which fictional lender workspace can view an assessment.</p>
              <ul>
                <li>Explicit, separate consent purposes</li>
                <li>Coverage and reason codes beside the score</li>
                <li>Downloadable synthetic reports</li>
              </ul>
              <Link href="/features" className="fc-btn fc-btn-secondary">Explore consumer features</Link>
            </Card>
            <Card className="fc-audience-card">
              <span className="fc-audience-icon fc-tone-violet"><Building2 size={22} /></span>
              <h3>For lenders</h3>
              <p>Review only explicitly authorized synthetic applicants inside an isolated organization workspace.</p>
              <ul>
                <li>Organization-scoped applicant access</li>
                <li>No automated approval or rejection</li>
                <li>Auditable report access</li>
              </ul>
              <Link href="/for-lenders" className="fc-btn fc-btn-secondary">See the lender experience</Link>
            </Card>
          </div>
        </div>
      </section>

      <section className="fc-cta-band">
        <div className="fc-public-container fc-cta-inner">
          <div><p className="fc-eyebrow">November 2026 prototype</p><h2>Explore the complete synthetic workspace.</h2><p>Consumer, lender, and administrator views are ready for demo walkthroughs.</p></div>
          <Link href="/login" className="fc-btn fc-btn-primary fc-btn-lg">Choose a demo account <ArrowRight size={17} /></Link>
        </div>
      </section>
    </div>
  );
}

export function HowItWorksPage() {
  return (
    <PublicPage
      eyebrow="How it works"
      title="A clear path from payment record to explained assessment."
      description="Finance Credibility is a design prototype. Each step below is simulated with fictional data and transparent boundaries."
    >
      <div className="fc-process-grid">
        {[
          { icon: ReceiptText, title: "Record", copy: "Add a fictional payment with a title, category, amount, due date, and recorded settlement date." },
          { icon: Layers3, title: "Normalize", copy: "Only explicitly recorded obligations enter the assessment. Pending future bills do not reduce punctuality." },
          { icon: Gauge, title: "Assess", copy: "Ten indicators are weighted and normalized. Missing indicators are excluded, never assigned zero." },
          { icon: Eye, title: "Explain", copy: "See score history, indicator values, coverage, reason codes, and experimental limitations." },
          { icon: ShieldCheck, title: "Consent", copy: "Processing and lender sharing are separate. Revocation blocks new sharing immediately." },
          { icon: FileText, title: "Export", copy: "Synthetic reports include identity labels, assessment dates, indicators, coverage, and the disclaimer." },
        ].map((step, index) => {
          const Icon = step.icon;
          return (
            <Card key={step.title} className="fc-process-card">
              <span className="fc-process-index">{String(index + 1).padStart(2, "0")}</span>
              <span className="fc-feature-icon"><Icon size={21} /></span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </Card>
          );
        })}
      </div>
      <Card className="fc-model-card">
        <div className="fc-model-head">
          <div><p className="fc-eyebrow">Illustrative model</p><h2>FC-DEMO-1.0 aggregation</h2></div>
          <Badge tone="blue">Experimental</Badge>
        </div>
        <p>Each available indicator is normalized to [0, 1]. Missing indicators are excluded from the denominator. The score is:</p>
        <code className="fc-formula">300 + floor(600 × weighted average + 0.5)</code>
        <div className="fc-model-grid">
          <div><strong>Minimum data</strong><span>6 records and 3 observed billing months</span></div>
          <div><strong>Insufficient status</strong><span>Returned instead of a misleading score</span></div>
          <div><strong>Versioning</strong><span>Weights and formula are immutable once used</span></div>
          <div><strong>Money</strong><span>Decimal amounts, normalized currency codes</span></div>
        </div>
        <InfoNote tone="amber" title="Not a validated risk model">
          Weights are illustrative design values, not empirically validated credit-risk weights.
        </InfoNote>
      </Card>
    </PublicPage>
  );
}

export function FeaturesPage() {
  const groups = [
    {
      title: "Payment management",
      icon: WalletCards,
      items: ["Create and edit synthetic payments", "Derived status from dates and settlement", "Category, period, status filters", "Recurring obligations and monthly totals"],
    },
    {
      title: "Credibility assessment",
      icon: Gauge,
      items: ["10-indicator explanation", "Six-month score history", "Data coverage beside score", "Reason codes and limitations"],
    },
    {
      title: "Analytics and insight",
      icon: BarChart3,
      items: ["Punctuality trends over time", "Category contribution analysis", "Plain-language financial insights", "Chart data available in tables"],
    },
    {
      title: "Privacy and control",
      icon: ShieldCheck,
      items: ["Purpose-specific consent records", "Withdraw sharing immediately", "Notification preferences", "Synthetic data reset"],
    },
    {
      title: "Reports",
      icon: FileText,
      items: ["Credibility summary", "Complete payment history", "Coverage and limitations", "CSV download and print-ready view"],
    },
    {
      title: "Lender workspace",
      icon: Building2,
      items: ["Authorized applicant list", "Assessment summaries and reason codes", "Organization-scoped access", "No automated lending decision"],
    },
  ];

  return (
    <PublicPage
      eyebrow="Features"
      title="A complete demo experience, with honest limits."
      description="Explore the tools available across consumer, lender, and administrator workspaces. All data and identities are fictional."
    >
      <div className="fc-three-grid">
        {groups.map((group) => {
          const Icon = group.icon;
          return (
            <Card key={group.title} className="fc-feature-detail-card">
              <span className="fc-feature-icon"><Icon size={21} /></span>
              <h3>{group.title}</h3>
              <ul>{group.items.map((item) => <li key={item}><Check size={15} />{item}</li>)}</ul>
            </Card>
          );
        })}
      </div>
    </PublicPage>
  );
}

export function ForLendersPage() {
  return (
    <PublicPage
      eyebrow="For lenders"
      title="An assessment view built around authorization."
      description="No guessed identifier grants access. Applicant data is shown only through active organization membership, authorization, and consumer consent."
    >
      <div className="fc-lender-public-grid">
        <Card className="fc-lender-public-main">
          <h2>Applicant access is checked on every request.</h2>
          <div className="fc-access-flow">
            {["Authenticated lender", "Active organization membership", "Active applicant authorization", "Active sharing consent", "Assessment lookup", "Access audit event"].map((step, index) => (
              <div key={step}><span>{index + 1}</span><strong>{step}</strong></div>
            ))}
          </div>
          <InfoNote tone="blue" title="Same policy everywhere">
            Lists, details, aggregates, reports, and exports use the same authorization rule. A
            guessed UUID never grants access.
          </InfoNote>
        </Card>
        <div className="fc-lender-public-side">
          {[
            { icon: Eye, title: "See explanations", copy: "Latest assessment, indicator values, history, coverage, and reason codes." },
            { icon: Target, title: "Keep human judgment", copy: "No automated approval, rejection, pricing, or default prediction." },
            { icon: ClipboardList, title: "Audit every read", copy: "Applicant and report access creates a structured audit event." },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.title} className="fc-mini-feature">
                <span className="fc-feature-icon"><Icon size={20} /></span>
                <div><h3>{item.title}</h3><p>{item.copy}</p></div>
              </Card>
            );
          })}
          <Card className="fc-lender-demo-cta">
            <Badge tone="violet">Lender demo</Badge>
            <h3>Open Demo Lender A</h3>
            <p>Use the lender demo account to review 36 fictional authorized applicants.</p>
            <Link href="/login" className="fc-btn fc-btn-primary">Sign in as lender <ArrowRight size={16} /></Link>
            <code>lender@fincred.demo · Demo@123</code>
          </Card>
        </div>
      </div>
    </PublicPage>
  );
}

export function AboutPage() {
  return (
    <PublicPage
      eyebrow="About"
      title="Financial responsibility is more than a single number."
      description="Finance Credibility is an experimental product design exploring how everyday payment behaviour can be explained with clarity, consent, and restraint."
    >
      <div className="fc-about-grid">
        <div className="fc-about-copy">
          <h2>Why this exists</h2>
          <p>
            Many people build a consistent record of paying rent, utilities, and recurring bills,
            yet that behaviour is often invisible in traditional financial snapshots. This prototype
            asks a narrow question: can everyday payment responsibility be represented in a calm,
            understandable way?
          </p>
          <h2>What this is not</h2>
          <p>
            This is not a credit bureau, a live lending product, or a validated risk model. It does
            not connect to bank accounts, payment providers, employers, or credit bureaus. It does
            not approve or reject loans.
          </p>
          <h2>How trust is designed in</h2>
          <p>
            Coverage appears beside the score. Missing records remain unknown. The model version is
            explicit. Consent is purpose-specific. Every synthetic-data surface carries the same
            disclaimer.
          </p>
        </div>
        <div className="fc-about-side">
          <Card><span className="fc-about-stat">72</span><strong>Synthetic records</strong><p>One complete design fixture spanning 12 months.</p></Card>
          <Card><span className="fc-about-stat">10</span><strong>Explained indicators</strong><p>No hidden black-box factor is used in the demo.</p></Card>
          <Card><span className="fc-about-stat">0</span><strong>Real financial connections</strong><p>No bank accounts, payment rails, or bureau integrations.</p></Card>
        </div>
      </div>
      <InfoNote tone="amber" title="Design deliverable, not production software">
        This November 2026 prototype is for product exploration and demonstration. Production
        deployment would require security, migration, and validation work described in the product
        blueprint.
      </InfoNote>
    </PublicPage>
  );
}

export function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("Demo feedback");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Complete your name, email, and message.");
      return;
    }
    setError("");
    const reference = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const existing = JSON.parse(window.localStorage.getItem("finance-credibility-support") ?? "[]") as unknown[];
      window.localStorage.setItem(
        "finance-credibility-support",
        JSON.stringify([...existing, { reference, name, email, topic, message, createdAt: new Date().toISOString() }]),
      );
    } catch {
      // The success state still reflects that nothing was sent externally.
    }
    setSubmitted(reference);
  }

  return (
    <PublicPage
      eyebrow="Contact"
      title="Talk to the demo team."
      description="This form stores a fictional support request in your browser only. No email is delivered."
    >
      <div className="fc-contact-grid">
        <Card className="fc-contact-form-card">
          {submitted ? (
            <div className="fc-success-state">
              <span className="fc-success-icon"><CheckCircle2 size={26} /></span>
              <h2>Demo request stored</h2>
              <p>Your reference is <code>{submitted}</code>. It exists only in this browser's local storage.</p>
              <button type="button" className="fc-btn fc-btn-secondary" onClick={() => { setSubmitted(null); setName(""); setEmail(""); setMessage(""); }}>Send another demo request</button>
            </div>
          ) : (
            <form className="fc-form" onSubmit={submit} noValidate>
              <div className="fc-form-grid">
                <label className="fc-field"><span>Name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Fictional name" /></label>
                <label className="fc-field"><span>Demo email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@fincred.demo" /></label>
              </div>
              <label className="fc-field"><span>Topic</span><select value={topic} onChange={(event) => setTopic(event.target.value)}><option>Demo feedback</option><option>Lender workspace</option><option>Accessibility</option><option>Product design</option><option>Other</option></select></label>
              <label className="fc-field"><span>Message</span><textarea rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Share feedback about the synthetic demo." /></label>
              {error ? <div className="fc-alert fc-alert-error"><p>{error}</p></div> : null}
              <div className="fc-note fc-note-blue"><Mail size={18} /><p>Storage is local-only. Do not submit real personal or financial information.</p></div>
              <button type="submit" className="fc-btn fc-btn-primary"><Send size={16} /> Store demo request</button>
            </form>
          )}
        </Card>
        <div className="fc-contact-side">
          <Card><h3>Demo support</h3><p>For walkthrough questions, use the seeded lender or admin workspace and the in-app Help page.</p><span className="fc-contact-meta">demo@fincred.example</span></Card>
          <Card><h3>Accessibility</h3><p>Charts include data tables, status never relies on colour alone, and reduced-motion preferences are respected.</p><Badge tone="green">WCAG-minded demo</Badge></Card>
          <Card><h3>Security boundary</h3><p>No real credentials. No production authentication. Never enter personal financial data.</p><Badge tone="amber">Synthetic only</Badge></Card>
        </div>
      </div>
    </PublicPage>
  );
}

const FAQS = [
  { q: "Is this a credit score?", a: "No. The score is an illustrative assessment of synthetic payment records. It is not a credit bureau score, a validated risk prediction, or a lending decision." },
  { q: "Where does the data come from?", a: "Every record is fictional and generated for the demo. There are no bank, payment provider, employer, or credit bureau connections." },
  { q: "What happens when data is missing?", a: "Missing records are treated as unknown, not missed. Indicators with insufficient observations are excluded. A score is withheld if there are fewer than 6 records or 3 observed billing months." },
  { q: "Can a lender see my assessment?", a: "Only if you grant a separate lender-sharing consent. In the demo, you can review and withdraw consent from the Consent & Privacy page." },
  { q: "Can I export a report?", a: "Yes. Reports are synthetic and include identity labels, assessment date, indicators, coverage, payment summary, and the disclaimer." },
  { q: "Does the demo predict loan approval?", a: "No. The product intentionally does not produce default predictions, eligibility, approval, rejection, or pricing outputs." },
  { q: "How do I reset the demo?", a: "Consumer Settings includes a synthetic data reset. It restores the original design fixtures in your browser." },
  { q: "Which demo accounts are available?", a: "Consumer, lender, and administrator accounts are listed on the sign-in page. All use the password Demo@123 and contain fictional data only." },
];

export function FaqPage() {
  return (
    <PublicPage eyebrow="FAQ" title="Questions worth asking." description="Clear answers about the synthetic demo, assessment boundaries, consent, and data handling.">
      <div className="fc-faq-list">
        {FAQS.map((item, index) => (
          <details key={item.q} className="fc-faq-item" open={index === 0}>
            <summary>{item.q}<span>+</span></summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </PublicPage>
  );
}

function LegalPage({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) {
  return (
    <PublicPage eyebrow={eyebrow} title={title} description="Last updated 11 November 2026. This prototype is for demonstration and product design only.">
      <div className="fc-legal">{children}</div>
    </PublicPage>
  );
}

export function PrivacyPage() {
  return (
    <LegalPage eyebrow="Privacy" title="Privacy notice">
      <h2>What the demo stores</h2>
      <p>The demo may store synthetic payment records, preferences, consent choices, and support requests in your browser's local storage. It uses a demo session cookie for role-based access.</p>
      <h2>What it does not store</h2>
      <p>No real bank account numbers, payment credentials, government identifiers, or credit bureau data are requested or connected.</p>
      <h2>Consent</h2>
      <p>Assessment processing and lender sharing are separate purposes. Withdrawing processing consent stops new assessments; withdrawing sharing consent blocks new lender access.</p>
      <h2>Retention</h2>
      <p>Synthetic records remain until you reset the demo or clear browser storage. Demo session cookies expire after eight hours.</p>
      <h2>Contact</h2>
      <p>Use the demo Contact page to store a fictional support request. Nothing is sent externally.</p>
    </LegalPage>
  );
}

export function TermsPage() {
  return (
    <LegalPage eyebrow="Terms" title="Demo terms">
      <h2>Permitted use</h2>
      <p>Use this prototype to explore the product design with fictional data. Do not enter real personal, identity, account, or financial information.</p>
      <h2>No financial service</h2>
      <p>The demo does not provide financial advice, credit reporting, lending decisions, eligibility determinations, or consumer reporting services.</p>
      <h2>No availability guarantee</h2>
      <p>This is an experimental prototype. Features, fixtures, and routes may change without notice.</p>
      <h2>Intellectual property</h2>
      <p>Finance Credibility branding, interface design, and demo content are provided for evaluation and product demonstration.</p>
      <h2>Acceptable use</h2>
      <p>Do not attempt to use the demo to process real data, attack the service, bypass authorization, or misrepresent the score as an official bureau metric.</p>
    </LegalPage>
  );
}

export function DisclaimerPage() {
  return (
    <LegalPage eyebrow="Important" title="Synthetic data and assessment disclaimer">
      <div className="fc-disclaimer-callout">
        <ShieldCheck size={22} />
        <p>{SYNTHETIC_BANNER}</p>
      </div>
      <h2>Illustrative only</h2>
      <p>All consumers, lenders, payments, scores, assessments, reports, and audit events in this product are fictional. The assessment is generated from synthetic records for design demonstration.</p>
      <h2>Not a credit bureau score</h2>
      <p>The 300–900 score is an experimental product fixture. It is not a credit score, FICO score, bureau score, or validated measure of creditworthiness.</p>
      <h2>No lending decision</h2>
      <p>Nothing here predicts default, determines eligibility, recommends approval, sets pricing, or replaces human lending judgment.</p>
      <h2>Data limitation</h2>
      <p>Records are self-recorded and unverified. Missing records are unknown, not missed. Coverage and model version are displayed with every assessment.</p>
      <h2>No real integrations</h2>
      <p>There are no bank accounts, payment gateways, credit bureaus, employer systems, or production authentication integrations in this demo.</p>
    </LegalPage>
  );
}
