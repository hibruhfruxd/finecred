"use client";

import { useState } from "react";
import Link from "next/link";

const auditRows = [
  ["2026-11-15 11:32:08Z", "admin@demo", "SYNTHETIC_GENERATION", "seed 202611 · 100 consumers"],
  ["2026-11-15 11:35:41Z", "lender-a@demo", "ASSESSMENT_READ", "Demo Consumer 001"],
  ["2026-11-15 11:40:17Z", "consumer-001", "PAYMENT_UPDATED", "Electricity · November"],
];

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <article className="pdf-card pdf-stat">
      <p className="pdf-stat-label">{label}</p>
      <div className="pdf-stat-value">{value}</div>
      <p className="pdf-stat-note">Design fixture, not a live count</p>
    </article>
  );
}

function AuditTable() {
  return (
    <div className="pdf-table-wrap">
      <table className="pdf-table">
        <thead><tr><th>UTC time</th><th>Actor</th><th>Action</th><th>Scope</th></tr></thead>
        <tbody>{auditRows.map((row) => <tr key={row.join("-")}><td className="pdf-mono">{row[0]}</td><td>{row[1]}</td><td><strong>{row[2]}</strong></td><td>{row[3]}</td></tr>)}</tbody>
      </table>
    </div>
  );
}

export function AdminDashboardPage() {
  const [message, setMessage] = useState("Ready to preview the fixed-seed fixture.");
  const [confirming, setConfirming] = useState(false);
  return (
    <>
      <header className="pdf-page-header">
        <div><p className="pdf-page-kicker">Admin · Demo Admin</p><h1 className="pdf-page-title">Admin workspace</h1></div>
        <div className="pdf-page-actions"><span className="pdf-pill" style={{ background: "#f4f4f6", color: "#08080a", borderColor: "#f4f4f6" }}>Admin role</span><span className="pdf-route-pill">Synthetic data only</span></div>
      </header>
      <div className="pdf-grid-4"><Stat label="Consumers" value="100" /><Stat label="Lender organizations" value="3" /><Stat label="Payment records" value="7,200" /><Stat label="Assessments" value="1,200" /></div>

      <div className="pdf-admin-grid" style={{ marginTop: 14 }}>
        <section className="pdf-card pdf-card-lg">
          <h2>Synthetic-data generation</h2>
          <div className="pdf-form-grid" style={{ marginTop: 16 }}>
            <label className="pdf-field"><span>Fixed seed</span><input className="pdf-input" defaultValue="202611" /></label>
            <label className="pdf-field"><span>Consumers</span><input className="pdf-input" defaultValue="100" /></label>
            <label className="pdf-field"><span>History (months)</span><input className="pdf-input" defaultValue="1–12" /></label>
            <label className="pdf-field"><span>Scenario</span><select className="pdf-select" defaultValue="Mixed"><option>Mixed</option><option>Strong</option><option>Sparse</option></select></label>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}><button className="pdf-btn pdf-btn-secondary" onClick={() => setMessage("Preview generated: 100 consumers · 1–12 months · seed 202611.")}>Preview generation</button><button className="pdf-btn pdf-btn-gold" onClick={() => setConfirming(true)}>Generate…</button></div>
          {confirming ? <div className="pdf-alert pdf-alert-warning" style={{ marginTop: 12 }}><span><strong>Generate synthetic data?</strong> This replaces fixture records and writes an immutable audit event.<br /><button className="pdf-btn pdf-btn-gold pdf-btn-sm" style={{ marginTop: 10 }} onClick={() => { setConfirming(false); setMessage("Generation complete. 100 consumers and 7,200 records replaced."); }}>Confirm generation</button></span></div> : <div className="pdf-alert pdf-alert-warning" style={{ marginTop: 12 }}><span>{message} Generation replaces demo data and asks for confirmation first. Action is written to an immutable audit event.</span></div>}
        </section>

        <aside className="pdf-card pdf-card-lg">
          <h2>Scoring governance</h2>
          {[["Model", "FC-DEMO-1.0"], ["Weights & formula", "Versioned"], ["Historical assessments", "Never silently rewritten"], ["Recalculation", "Logged, attributed"]].map(([label, value], index) => <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", padding: "15px 0", borderBottom: index === 3 ? 0 : "1px solid var(--line)" }}><span>{label}</span><strong style={{ color: index === 0 ? "#08080a" : "var(--muted)", background: index === 0 ? "#f4f4f6" : "transparent", padding: index === 0 ? "4px 10px" : 0, borderRadius: 999, fontSize: index === 0 ? 10 : 11 }}>{index === 0 ? `● ${value}` : value}</strong></div>)}
        </aside>
      </div>

      <section className="pdf-card" style={{ marginTop: 14 }}><div className="pdf-card-title-row"><h2>Audit log</h2><span className="pdf-pill pdf-pill-slate">Append-only</span></div><AuditTable /></section>
    </>
  );
}

function FixturePage({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <>
      <header className="pdf-page-header"><div><p className="pdf-page-kicker">Admin · Demo Admin</p><h1 className="pdf-page-title">{title}</h1></div><span className="pdf-pill">Admin role</span></header>
      <section className="pdf-card pdf-card-lg"><h2>{title} fixture</h2><p style={{ marginTop: 6 }}>Design fixture records for reviewing the workspace layout. No live customer data is shown.</p><div className="pdf-grid-3" style={{ marginTop: 18 }}>{rows.map(([label, value], index) => <article key={`${label}-${index}`} className="pdf-card" style={{ background: "var(--surface-2)", boxShadow: "none" }}><p className="pdf-card-label">{label}</p><p style={{ color: "var(--text)", fontSize: 17, marginTop: 10 }}>{value}</p></article>)}</div><div className="pdf-alert pdf-alert-info" style={{ marginTop: 18 }}><span><strong>Fixture only.</strong> These records are fictional and replaceable.</span></div></section>
    </>
  );
}

export function AdminUsersPage() {
  return <FixturePage title="Users" rows={[["Consumer fixture", "Demo Consumer 001"], ["Lender member", "lender-a@demo"], ["Administrator", "admin@demo"]]} />;
}
export function AdminLendersPage() {
  return <FixturePage title="Lender organizations" rows={[["Primary", "Demo Lender A"], ["Secondary", "Demo Lender B"], ["Review fixture", "Demo Lender C"]]} />;
}
export function AdminPaymentsPage() {
  return <FixturePage title="Payment records" rows={[["Rent · November", "INR 18,000"], ["Electricity · November", "INR 2,450"], ["Water · November", "INR 650"]]} />;
}
export function AdminScoringPage() {
  return <FixturePage title="Scoring engine" rows={[["Model", "FC-DEMO-1.0"], ["Range", "300–900 illustrative"], ["History", "Never silently rewritten"]]} />;
}
export function AdminSyntheticDataPage() {
  return <FixturePage title="Synthetic data" rows={[["Fixed seed", "202611"], ["Consumers", "100"], ["History", "1–12 months"]]} />;
}
export function AdminReportsPage() {
  return <FixturePage title="Reports" rows={[["Credibility summary", "Demo Consumer 001"], ["Payment history", "12 months · 72 records"], ["Coverage", "4 categories"]]} />;
}
export function AdminConsentsPage() {
  return <FixturePage title="Consent records" rows={[["Assessment processing", "Granted"], ["Lender sharing A", "Granted"], ["Lender sharing B", "Revoked"]]} />;
}
export function AdminAuditLogsPage() {
  return <><header className="pdf-page-header"><div><p className="pdf-page-kicker">Admin · Demo Admin</p><h1 className="pdf-page-title">Audit logs</h1></div><span className="pdf-pill pdf-pill-slate">Append-only</span></header><section className="pdf-card"><AuditTable /></section></>;
}
export function AdminSettingsPage() {
  return <FixturePage title="System settings" rows={[["Theme", "Dark default"], ["Data retention", "Demo reset"], ["Audit integrity", "Append-only"]]} />;
}
