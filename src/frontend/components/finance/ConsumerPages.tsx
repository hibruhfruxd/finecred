"use client";

import { Check, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";

const SCORE_HISTORY = [
  { month: "Jun", value: 741 },
  { month: "Jul", value: 758 },
  { month: "Aug", value: 764 },
  { month: "Sep", value: 770 },
  { month: "Oct", value: 770 },
  { month: "Nov", value: 782 },
];

function LineChart() {
  const points = SCORE_HISTORY.map((item, index) => {
    const x = 48 + index * 104;
    const y = 146 - ((item.value - 730) / 60) * 112;
    return { ...item, x, y };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  return (
    <svg className="pdf-chart-box" viewBox="0 0 640 190" role="img" aria-label="Credibility score rose from 741 in June to 782 in November">
      {[740, 760, 780].map((tick) => {
        const y = 146 - ((tick - 730) / 60) * 112;
        return (
          <g key={tick}>
            <line className="pdf-chart-grid-line" x1="42" x2="610" y1={y} y2={y} />
            <text className="pdf-chart-label" x="8" y={y + 3}>{tick}</text>
          </g>
        );
      })}
      <path className="pdf-chart-path" d={path} />
      {points.map((point) => (
        <g key={point.month}>
          <circle className="pdf-chart-dot" cx={point.x} cy={point.y} r="4" />
          <text className="pdf-chart-value" textAnchor="middle" x={point.x} y={point.y - 9}>{point.value}</text>
          <text className="pdf-chart-label" textAnchor="middle" x={point.x} y="176">{point.month}</text>
        </g>
      ))}
    </svg>
  );
}

function PageHeader({ kicker, title }: { kicker: string; title: string }) {
  return (
    <header className="pdf-page-header">
      <div>
        <p className="pdf-page-kicker">{kicker}</p>
        <h1 className="pdf-page-title">{title}</h1>
      </div>
    </header>
  );
}

function Stat({ label, value, note }: { label: string; value: ReactNode; note?: ReactNode }) {
  return (
    <article className="pdf-card pdf-stat">
      <p className="pdf-stat-label">{label}</p>
      <div className="pdf-stat-value">{value}</div>
      {note ? <p className="pdf-stat-note">{note}</p> : null}
    </article>
  );
}

const recent = [
  { title: "November rent", category: "Rent", amount: "INR 18,000", due: "05 Nov", paid: "03 Nov", status: "Paid on time", tone: "success" },
  { title: "Electricity", category: "Utilities", amount: "INR 2,450", due: "08 Nov", paid: "10 Nov", status: "Paid late", tone: "warning" },
  { title: "Water utility", category: "Utilities", amount: "INR 650", due: "15 Nov", paid: "—", status: "Pending", tone: "slate" },
];

export function ConsumerDashboardPage() {
  return (
    <>
      <PageHeader kicker="Synthetic workspace · Demo Consumer 001" title="Overview" />
      <div className="pdf-grid-4">
        <Stat label="Illustrative score" value={<>782 <small>/ 900</small></>} note={<><strong>+12</strong> vs previous</>} />
        <Stat label="On-time payments" value="94%" note="of 72 records" />
        <Stat label="Monthly obligations" value="INR 24,850" note="Across active bills" />
        <Stat label="Coverage" value="12 months" note="across 4 categories" />
      </div>

      <div className="pdf-dashboard-grid">
        <section className="pdf-card pdf-card-lg">
          <div className="pdf-card-title-row"><h2>Credibility score history</h2><span className="pdf-small">Jun – Nov 2026</span></div>
          <LineChart />
          <p style={{ marginTop: 12 }}>Text summary: score rose from 741 in June to 782 in November, flat at 770 in September and October. <Link href="/score" className="pdf-auth-link">View as table</Link></p>
        </section>

        <section className="pdf-card pdf-card-lg">
          <h2>What influences your score</h2>
          {[["Payment punctuality", 94], ["Payment consistency", 92], ["Obligation management", 95], ["Data coverage", 100]].map(([label, value]) => (
            <div className="pdf-progress-row" key={label as string}>
              <div className="pdf-progress-head"><span>{label}</span><strong>{value}/100</strong></div>
              <div className="pdf-progress-track"><div className={`pdf-progress-fill ${label === "Data coverage" ? "green" : ""}`} style={{ width: `${value}%` }} /></div>
            </div>
          ))}
          <div className="pdf-alert pdf-alert-success" style={{ marginTop: 14 }}><Sparkles size={16} /><span><strong>What helps:</strong> high recorded punctuality.<br /><strong>Review:</strong> two payments were settled after their due dates.</span></div>
        </section>
      </div>

      <section className="pdf-card" style={{ marginTop: 14 }}>
        <div className="pdf-card-title-row"><h2>Recent activity</h2><Link href="/payments" className="pdf-btn pdf-btn-primary pdf-btn-sm"><Plus size={13} /> Add payment</Link></div>
        <div className="pdf-table-wrap">
          <table className="pdf-table">
            <thead><tr><th>Title</th><th>Amount</th><th>Due</th><th>Paid</th><th>Status</th></tr></thead>
            <tbody>{recent.map((item) => <tr key={item.title}><td><div className="pdf-table-title">{item.title}</div><div className="pdf-table-sub">{item.category}</div></td><td>{item.amount}</td><td>{item.due}</td><td>{item.paid}</td><td><span className={`pdf-pill pdf-pill-${item.tone === "success" ? "success" : item.tone === "warning" ? "warning" : "slate"}`}><span className="pdf-pill-dot" />{item.status}</span></td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <div className="pdf-grid-3" style={{ marginTop: 14 }}>
        <article className="pdf-card"><span className="pdf-pill pdf-pill-success">Insight</span><h3 style={{ marginTop: 14 }}>Your rent is consistently paid early</h3></article>
        <article className="pdf-card"><span className="pdf-pill pdf-pill-warning">Review</span><h3 style={{ marginTop: 14 }}>Two utility payments were settled after the due date</h3></article>
        <article className="pdf-card"><span className="pdf-pill pdf-pill-info">Suggestion</span><h3 style={{ marginTop: 14 }}>Add a recurring bill to improve coverage</h3></article>
      </div>
    </>
  );
}

export function ConsumerPaymentsPage() {
  const [saved, setSaved] = useState(true);
  return (
    <>
      <PageHeader kicker="Synthetic workspace · Demo Consumer 001" title="My payments" />
      <div className="pdf-alert pdf-alert-warning" style={{ marginBottom: 14 }}><span><strong>Demo records only.</strong> Do not enter real financial or identity information.</span></div>
      <div className="pdf-payments-grid">
        <section className="pdf-card pdf-card-lg">
          <div className="pdf-card-title-row"><h2>Add recurring payment</h2><span className="pdf-pill pdf-pill-info">Simulated</span></div>
          <form className="pdf-form" onSubmit={(event) => { event.preventDefault(); setSaved(true); }}>
            <div className="pdf-form-grid">
              <label className="pdf-field"><span>Category</span><select className="pdf-select" defaultValue="Utilities"><option>Utilities</option><option>Rent</option><option>Insurance</option></select></label>
              <label className="pdf-field"><span>Title</span><input className="pdf-input" defaultValue="Internet bill" /></label>
              <label className="pdf-field"><span>Amount (INR)</span><input className="pdf-input pdf-input-error" defaultValue="-50" /><span className="pdf-error-text">Enter an amount greater than 0.</span></label>
              <label className="pdf-field"><span>Billing period</span><select className="pdf-select" defaultValue="November 2026"><option>November 2026</option><option>October 2026</option></select></label>
              <label className="pdf-field"><span>Due date</span><input className="pdf-input" defaultValue="20 Nov 2026" /></label>
              <label className="pdf-field"><span>Payment date</span><input className="pdf-input" placeholder="Optional — leave blank if unpaid" /></label>
              <label className="pdf-field"><span>Simulated payment method</span><select className="pdf-select" defaultValue="Demo UPI (simulated)"><option>Demo UPI (simulated)</option><option>Demo auto-debit (simulated)</option></select></label>
              <div className="pdf-field"><span>Recurring</span><div style={{ display: "flex", alignItems: "center", gap: 9, minHeight: 38 }}><button type="button" className="pdf-toggle" aria-label="Repeats monthly" /><span className="pdf-small" style={{ color: "var(--text)" }}>Repeats monthly</span></div></div>
            </div>
            <div className="pdf-alert" style={{ background: "#15151a" }}><span><strong>Status is derived from dates:</strong> paid on or before due → <span className="text">Paid on time</span>; after due → Paid late; no payment date → Pending.</span></div>
            <div style={{ display: "flex", gap: 8 }}><button className="pdf-btn pdf-btn-primary" type="submit">Save demo payment</button><button className="pdf-btn pdf-btn-secondary" type="button">Reset</button></div>
            <p className="pdf-small">Entered values are kept after a recoverable error. Submit is disabled while saving.</p>
          </form>
        </section>

        <div style={{ display: "grid", gap: 14 }}>
          <section className="pdf-card">
            <div className="pdf-card-title-row"><h2>Payment records</h2><div style={{ display: "flex", gap: 6 }}>{["Category: All", "Period: November", "Status: All"].map((filter) => <span key={filter} className="pdf-pill">{filter} ▾</span>)}</div></div>
            <div className="pdf-table-wrap"><table className="pdf-table"><thead><tr><th>Title / category</th><th>Amount</th><th>Due / paid</th><th>Status</th><th>Action</th></tr></thead><tbody>{recent.map((item) => <tr key={item.title}><td><div className="pdf-table-title">{item.title}</div><div className="pdf-table-sub">{item.category}</div></td><td>{item.amount}</td><td>{item.due}<div className="pdf-table-sub">{item.paid === "—" ? "not paid" : `paid ${item.paid}`}</div></td><td><span className={`pdf-pill pdf-pill-${item.tone === "success" ? "success" : item.tone === "warning" ? "warning" : "slate"}`}><span className="pdf-pill-dot" />{item.status}</span></td><td><button className="pdf-btn pdf-btn-secondary pdf-btn-sm">Edit</button></td></tr>)}</tbody></table></div>
          </section>
          {saved ? <div className="pdf-alert pdf-alert-success"><Check size={17} /><span><strong>Demo payment saved.</strong> Status derived as “Pending”. Your assessment will refresh on the next run.</span></div> : null}
          <section className="pdf-card"><div className="pdf-card-title-row"><h2>November at a glance</h2><span className="pdf-small">3 records</span></div><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><span className="pdf-small"><span style={{ color: "var(--mint)" }}>●</span> 1 paid on time</span><span className="pdf-small"><span style={{ color: "var(--amber)" }}>●</span> 1 paid late</span><span className="pdf-small"><span style={{ color: "var(--slate)" }}>●</span> 1 pending · not counted against punctuality</span></div></section>
          <div className="pdf-grid-2"><section className="pdf-card"><h3>Loading</h3><div style={{ display: "grid", gap: 10, marginTop: 13 }}><div className="pdf-skeleton" style={{ width: "65%" }} /><div className="pdf-skeleton" style={{ width: "95%" }} /><div className="pdf-skeleton" style={{ width: "80%" }} /></div></section><section className="pdf-card pdf-empty"><div className="pdf-empty-icon"><Plus size={18} /></div><h3>Empty</h3><p>No payments match these filters.</p><button className="pdf-btn pdf-btn-secondary pdf-btn-sm" style={{ marginTop: 12 }}>Clear filters</button></section></div>
        </div>
      </div>
    </>
  );
}

export function ConsumerScorePage() {
  const indicators = [["Payment consistency", 92, "12%"], ["Payment punctuality", 94, "18%"], ["Payment delays", 90, "12%"], ["Payment regularity", 88, "8%"], ["Expense stability", 86, "6%"], ["Payment continuity", 92, "8%"], ["Obligation management", 95, "12%"], ["Historical stability", 89, "8%"], ["Data coverage", 100, "10%"]];
  return (
    <>
      <PageHeader kicker="Synthetic workspace · Demo Consumer 001" title="Credibility score" />
      <div className="pdf-score-grid">
        <div style={{ display: "grid", gap: 14 }}>
          <section className="pdf-score-hero">
            <div className="pdf-score-hero-top"><span>Illustrative credibility assessment</span><span className="pdf-pill pdf-pill-info">FC-DEMO-1.0</span></div>
            <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", alignItems: "center", gap: 22 }}>
              <svg viewBox="0 0 120 120" width="160" height="160" aria-label="782 out of 900"><circle cx="60" cy="60" r="48" stroke="#24242c" strokeWidth="13" fill="none" /><circle cx="60" cy="60" r="48" stroke="#4f7cff" strokeWidth="13" fill="none" strokeDasharray="302" strokeDashoffset="79" strokeLinecap="round" transform="rotate(-90 60 60)" /></svg>
              <div><div className="pdf-score-number">782</div><p style={{ color: "#b8bdcc", marginTop: 8 }}>out of 900 · range 300–900</p><span className="pdf-pill pdf-pill-success" style={{ marginTop: 12 }}><span className="pdf-pill-dot" />+12 vs previous assessment</span></div>
            </div>
            <p style={{ color: "#a3a7b8", fontSize: 11, marginTop: 20 }}>Assessed 11 Nov 2026 · Model FC-DEMO-1.0</p>
          </section>
          <div className="pdf-grid-3"><Stat label="Observed" value="12 months" /><Stat label="Records" value="72" /><Stat label="Categories" value="4" /></div>
          <section className="pdf-card"><h2>In plain language</h2><p style={{ marginTop: 10 }}>High punctuality and strong obligation management contribute positively. Two payments settled after their due dates are reflected in the delay indicator.</p></section>
          <div className="pdf-alert pdf-alert-info"><span><strong>Important:</strong> Missing records are unknown, not missed. Pending future bills do not reduce punctuality.</span></div>
          <section className="pdf-card"><div className="pdf-card-title-row"><h2>Score history</h2><span className="pdf-small">Jun – Nov 2026</span></div><LineChart /><p className="pdf-small" style={{ marginTop: 8 }}>741 in June to 782 in November; flat at 770 across September and October.</p></section>
        </div>

        <aside className="pdf-card" style={{ padding: 22 }}>
          <div className="pdf-card-title-row"><h2>Indicator breakdown</h2><span className="pdf-small">Score / 100 · weight</span></div>
          {indicators.map(([label, value, weight]) => <div className="pdf-progress-row" key={label as string}><div className="pdf-progress-head"><span>{label}</span><span><strong>{value}/100</strong> · {weight}</span></div><div className="pdf-progress-track"><div className="pdf-progress-fill" style={{ width: `${value}%` }} /></div></div>)}
          <div className="pdf-alert pdf-alert-danger" style={{ marginTop: 14 }}><span><strong>This is not a credit bureau score</strong>, a validated risk prediction, or a loan-eligibility decision.</span></div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}><button className="pdf-btn pdf-btn-primary">Download report</button><Link href="/payments" className="pdf-btn pdf-btn-secondary">View payment history</Link><Link href="/consent" className="pdf-btn pdf-btn-secondary">Review consent settings</Link></div>
        </aside>
      </div>
    </>
  );
}

export function ConsumerConsentPage() {
  return (
    <>
      <PageHeader kicker="Synthetic workspace · Demo Consumer 001" title="Consent & privacy" />
      <h2 style={{ fontSize: "clamp(2.2rem, 4vw, 3.4rem)", margin: "8px 0 20px" }}>You decide who can view your synthetic assessment.</h2>
      <div className="pdf-consent-grid">
        {[["Assessment processing", "Enabled", "Consent recorded. FC processes your demo payment records to produce the illustrative assessment."], ["Lender sharing", "Authorized", "Demo Lender A · authorized. They can view your latest assessment and report. Every view is logged."]].map(([title, status, copy]) => <section className="pdf-card pdf-card-lg" key={title}><div className="pdf-card-title-row"><h2>{title}</h2><span className="pdf-pill pdf-pill-success"><span className="pdf-pill-dot" />{status}</span></div><p>{copy}</p><div style={{ display: "flex", gap: 8, marginTop: 22 }}><button className="pdf-btn pdf-btn-secondary">Review</button><button className="pdf-btn pdf-btn-danger">Withdraw</button></div></section>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(300px, 0.7fr)", gap: 14, marginTop: 14 }}>
        <div style={{ display: "grid", gap: 14 }}>
          <section className="pdf-card"><h2>Consent history</h2><div className="pdf-table-wrap" style={{ marginTop: 12 }}><table className="pdf-table"><thead><tr><th>Purpose</th><th>Policy version</th><th>Timestamp (UTC)</th><th>Status</th></tr></thead><tbody>{[["Assessment processing", "v1.0", "2026-11-01 09:12", "Granted"], ["Lender sharing · Demo Lender A", "v1.0", "2026-11-03 14:40", "Granted"], ["Lender sharing · Demo Lender B", "v1.0", "2026-10-12 07:25", "Revoked"]].map((row) => <tr key={row.join("-")}><td>{row[0]}</td><td>{row[1]}</td><td className="pdf-mono">{row[2]}</td><td><span className={`pdf-pill ${row[3] === "Granted" ? "pdf-pill-success" : "pdf-pill-danger"}`}><span className="pdf-pill-dot" />{row[3]}</span></td></tr>)}</tbody></table></div></section>
          <section className="pdf-card"><h2>Recent access events</h2>{[["Demo Lender A viewed your assessment", "2026-11-11 10:04 UTC"], ["Report exported by Demo Lender A", "2026-11-11 10:06 UTC"]].map(([event, time]) => <div key={event} style={{ display: "flex", justifyContent: "space-between", gap: 18, borderTop: "1px solid var(--line)", padding: "13px 0" }}><span>{event}</span><time className="pdf-mono pdf-small">{time}</time></div>)}<p className="pdf-small">You can see every time your assessment is viewed.</p></section>
        </div>
        <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
          <section className="pdf-card"><h2>Retention</h2><p style={{ marginTop: 8 }}>Demo records until reset.</p></section>
          <section className="pdf-card"><h2>What Demo Lender A can see</h2>{["Latest assessment and score history", "Indicator breakdown and reason codes", "Payment summary (no bank or card details)"].map((item) => <p key={item} style={{ marginTop: 10 }}><span style={{ color: "var(--mint)" }}>✓</span> {item}</p>)}<p style={{ marginTop: 10, color: "#ffadb6" }}><span>×</span> Identity documents — never collected</p></section>
          <section className="pdf-card" style={{ borderColor: "rgba(255,92,108,0.45)" }}><span className="pdf-pill pdf-pill-danger">Confirmation</span><h2 style={{ marginTop: 14 }}>Withdraw lender sharing?</h2><p style={{ marginTop: 8 }}>Demo Lender A will lose access <strong>immediately</strong>. You can grant consent again at any time.</p><div style={{ display: "flex", gap: 8, marginTop: 16 }}><button className="pdf-btn pdf-btn-secondary">Keep sharing</button><button className="pdf-btn pdf-btn-danger">Withdraw now</button></div></section>
        </div>
      </div>
    </>
  );
}

export const ConsumerProfilePage = ConsumerDashboardPage;
export const ConsumerSettingsPage = ConsumerDashboardPage;
export const ConsumerHelpPage = ConsumerDashboardPage;
export const ConsumerAnalyticsPage = ConsumerScorePage;
export const ConsumerInsightsPage = ConsumerDashboardPage;
export const ConsumerReportsPage = ConsumerScorePage;
export const ConsumerNotificationsPage = ConsumerDashboardPage;
export function ConsumerNewPaymentPage() { return <ConsumerPaymentsPage />; }
export function ConsumerPaymentDetailPage() { return <ConsumerPaymentsPage />; }
