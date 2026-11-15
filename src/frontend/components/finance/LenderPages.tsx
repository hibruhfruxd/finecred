import type { ReactNode } from "react";
import Link from "next/link";

const accessSteps = [
  "Authenticated lender",
  "Active organization membership",
  "Active applicant authorization",
  "Active sharing consent",
  "Assessment lookup",
  "Access audit event",
];

function Stat({ label, value, note }: { label: string; value: ReactNode; note?: ReactNode }) {
  return (
    <article className="pdf-card pdf-stat">
      <p className="pdf-stat-label">{label}</p>
      <div className="pdf-stat-value" style={{ fontSize: label === "Access checks" ? "1.6rem" : undefined }}>{value}</div>
      {note ? <p className="pdf-stat-note">{note}</p> : null}
    </article>
  );
}

export function LenderDashboardPage() {
  const applicants = [
    { name: "Demo Consumer 001", score: "782", coverage: "12 months", punctuality: "94%", assessed: "11 Nov 2026", status: "Active", tone: "success" },
    { name: "Demo Consumer 014", score: "701", coverage: "6 months", punctuality: "86%", assessed: "11 Nov 2026", status: "Active", tone: "success" },
    { name: "Demo Consumer 027", score: "No score · Insufficient", coverage: "—", punctuality: "—", assessed: "11 Nov 2026", status: "Awaiting data", tone: "warning" },
  ];
  return (
    <>
      <header className="pdf-page-header">
        <div><p className="pdf-page-kicker">Demo Lender A · Authenticated lender</p><h1 className="pdf-page-title">Lender workspace</h1></div>
      </header>
      <div className="pdf-grid-4">
        <Stat label="Authorized applicants" value="36" note="Active consent only" />
        <Stat label="Mean illustrative score" value="731" note="Across scored applicants" />
        <Stat label="Coverage 6+ months" value="81%" note="of authorized applicants" />
        <Stat label="Access checks" value="Every request" note="Logged as audit events" />
      </div>

      <section className="pdf-card" style={{ marginTop: 14, padding: 0 }}>
        <div className="pdf-table-wrap">
          <table className="pdf-table">
            <thead><tr><th>Applicant</th><th>Score</th><th>Coverage</th><th>Punctuality</th><th>Assessed</th><th>Consent</th></tr></thead>
            <tbody>{applicants.map((item) => <tr key={item.name}><td><strong>{item.name}</strong></td><td>{item.score}</td><td>{item.coverage}</td><td>{item.punctuality}</td><td>{item.assessed}</td><td><span className={`pdf-pill pdf-pill-${item.tone}`}><span className="pdf-pill-dot" />{item.status}</span></td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <div className="pdf-lender-grid" style={{ marginTop: 14 }}>
        <section className="pdf-card pdf-card-lg" id="reports">
          <div className="pdf-card-title-row"><h2>Applicant detail · Demo Consumer 001</h2><button className="pdf-btn pdf-btn-secondary pdf-btn-sm">Authorized report export</button></div>
          <p className="pdf-small">Latest assessment · 11 Nov 2026</p>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(180px, 0.45fr) 1fr", gap: 22, alignItems: "center", marginTop: 10 }}>
            <div><div className="pdf-score-number" style={{ fontSize: "4.5rem" }}>782 <small style={{ fontSize: "0.25em", color: "var(--muted)" }}>/ 900</small></div><p className="pdf-small" style={{ marginTop: 12 }}>Score history Jun → Nov</p><div className="pdf-bars">{[42, 54, 60, 64, 64, 78].map((height, index) => <div key={index} className="pdf-bar" style={{ height: `${height}%` }} />)}</div><div className="pdf-bar-labels"><span>741</span><span>758</span><span>764</span><span>770</span><span>770</span><span>782</span></div></div>
            <div>{[["Punctuality", 94], ["Consistency", 92], ["Obligation management", 95]].map(([label, value]) => <div className="pdf-progress-row" key={label as string}><div className="pdf-progress-head"><span>{label}</span><strong>{value}/100</strong></div><div className="pdf-progress-track"><div className="pdf-progress-fill" style={{ width: `${value}%` }} /></div></div>)}</div>
          </div>
          <div className="pdf-grid-3" style={{ marginTop: 18 }}>
            <div><p className="pdf-card-label">Reason codes</p><p style={{ marginTop: 8 }}>R01 High punctuality<br />R02 Strong obligation mgmt<br />R03 Two late settlements</p></div>
            <div><p className="pdf-card-label">Data-quality flags</p><p style={{ marginTop: 8 }}>No blocking flags<br />1 pending bill excluded</p></div>
            <div><p className="pdf-card-label">Payment summary</p><p style={{ marginTop: 8 }}>72 records · 4 categories<br />2 settled late</p></div>
          </div>
        </section>

        <aside className="pdf-card" id="access-policy">
          <h2>Access policy</h2>
          <div style={{ display: "grid", gap: 8, marginTop: 12 }}>{accessSteps.map((step, index) => <div key={step} className="pdf-alert" style={{ padding: "9px 11px" }}><span className="pdf-auth-link pdf-mono">{index + 1}.</span><span>{step}</span></div>)}</div>
          <div className="pdf-alert pdf-alert-danger" style={{ marginTop: 14 }}><span><strong>No automated loan approval or rejection.</strong> This workspace supports review and documentation only.</span></div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 14 }}><span className="pdf-pill pdf-pill-danger">Forbidden</span><span className="pdf-pill pdf-pill-warning">Session expired</span><span className="pdf-pill pdf-pill-slate">Insufficient data</span><span className="pdf-pill pdf-pill-info">Loading</span></div>
          <p className="pdf-small" style={{ marginTop: 8 }}>states on states page</p>
        </aside>
      </div>
    </>
  );
}

export function LenderReportsPage() {
  return <LenderDashboardPage />;
}
export function LenderApplicantsPage() {
  return <LenderDashboardPage />;
}
export function LenderApplicantDetailPage() {
  return <LenderDashboardPage />;
}
export function LenderAssessmentsPage() {
  return <LenderDashboardPage />;
}
export function LenderApiPage() {
  return <LenderDashboardPage />;
}
export function LenderSettingsPage() {
  return <LenderDashboardPage />;
}
