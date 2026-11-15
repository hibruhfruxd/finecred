import Link from "next/link";
import { Check, RefreshCw, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

function StateCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <article className="pdf-state-card">
      <p className="pdf-state-label">{label}</p>
      {children}
    </article>
  );
}

export function StatesPage() {
  return (
    <section className="pdf-public-container pdf-states-page">
      <p className="pdf-eyebrow">Required UI states</p>
      <h1 className="pdf-section-title" style={{ maxWidth: 900 }}>Every state is designed, not an afterthought.</h1>

      <div className="pdf-states-grid">
        <StateCard label="Loading skeleton">
          <div style={{ display: "grid", gap: 10 }}><div className="pdf-skeleton" style={{ width: "72%" }} /><div className="pdf-skeleton" style={{ width: "100%" }} /><div className="pdf-skeleton" style={{ width: "85%" }} /><div className="pdf-card" style={{ height: 70, background: "var(--surface-2)", boxShadow: "none" }} /></div>
        </StateCard>

        <StateCard label="Success toast">
          <div className="pdf-alert pdf-alert-success"><Check size={18} /><span><strong>Demo payment saved.</strong><br />Status derived as Pending.</span></div>
        </StateCard>

        <StateCard label="Empty state">
          <div className="pdf-empty"><div className="pdf-empty-icon">○</div><h3>No payments yet</h3><p>Add a demo bill to begin.</p><Link href="/payments" className="pdf-btn pdf-btn-primary" style={{ marginTop: 14 }}>Add payment</Link></div>
        </StateCard>

        <StateCard label="Insufficient data">
          <div className="pdf-alert pdf-alert-info"><span><strong>Insufficient data.</strong> At least 3 months of records are needed. Missing records are unknown, not missed.</span></div>
        </StateCard>

        <StateCard label="Expired session">
          <div className="pdf-alert pdf-alert-warning"><TriangleAlert size={18} /><span><strong>Your session has expired.</strong> Sign in again — your entries on this page are kept.</span></div>
          <Link href="/login" className="pdf-btn pdf-btn-primary" style={{ marginTop: 14 }}>Sign in</Link>
        </StateCard>

        <StateCard label="Forbidden / no access">
          <div className="pdf-alert pdf-alert-danger"><span><strong>No access.</strong> This applicant has not authorized Demo Lender A, or consent was withdrawn.</span></div>
        </StateCard>

        <StateCard label="API failure">
          <div className="pdf-alert pdf-alert-danger"><span><strong>Something went wrong.</strong> We couldn&apos;t load this just now. Nothing was changed.</span></div>
          <button className="pdf-btn pdf-btn-secondary" style={{ marginTop: 14 }}><RefreshCw size={14} /> Try again</button>
        </StateCard>

        <StateCard label="Validation error">
          <label className="pdf-field"><span>Amount (INR)</span><input className="pdf-input pdf-input-error" defaultValue="-50" /><span className="pdf-error-text">Enter an amount greater than 0.</span></label>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}><button className="pdf-btn" disabled>Saving…</button><span className="pdf-small">Submit disabled · values retained</span></div>
        </StateCard>

        <StateCard label="Confirmation modal">
          <div className="pdf-card" style={{ background: "var(--surface-2)", boxShadow: "none" }}>
            <h3>Regenerate synthetic data?</h3>
            <p style={{ margin: "8px 0 14px" }}>Replaces all demo records. Also used for delete and consent withdrawal.</p>
            <div style={{ display: "flex", gap: 8 }}><button className="pdf-btn pdf-btn-secondary">Cancel</button><button className="pdf-btn pdf-btn-gold">Regenerate</button></div>
          </div>
        </StateCard>
      </div>
    </section>
  );
}

export function ResponsiveThemingPage() {
  return (
    <section className="pdf-public-container pdf-states-page">
      <p className="pdf-eyebrow">Responsive & theming</p>
      <h1 className="pdf-section-title" style={{ maxWidth: 980 }}>One system from 320 to 1440 px, light and dark.</h1>
      <div className="pdf-grid-3" style={{ marginTop: 34 }}>
        <article className="pdf-card">
          <p className="pdf-card-label">Mobile · single column, top navigation, no horizontal scroll</p>
          <div className="pdf-card" style={{ marginTop: 16, background: "#09090c" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><strong>FC</strong><span>☰ Menu</span></div>
            <h2 style={{ margin: "24px 0 16px" }}>Overview</h2>
            {["782 / 900", "94% of 72", "INR 24,850", "12 months · 4 categories"].map((item) => <div key={item} className="pdf-card" style={{ padding: 12, marginBottom: 8, boxShadow: "none", background: "var(--surface-2)" }}><p className="pdf-card-label">Illustrative score</p><strong style={{ fontSize: 18 }}>{item}</strong></div>)}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: 10, borderTop: "1px solid var(--line)" }}><span>November rent<br /><small>INR 18,000 · due 05 Nov</small></span><span className="pdf-pill pdf-pill-success">● On time</span></div>
          </div>
        </article>

        <article className="pdf-card">
          <p className="pdf-card-label">Tablet · 2-column KPIs, stacked panels, condensed tables</p>
          <div className="pdf-card" style={{ marginTop: 16, background: "#09090c" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><strong>Finance Credibility</strong><span className="pdf-small">Overview · Payments · Score</span></div>
            <h2 style={{ margin: "24px 0 16px" }}>Overview</h2>
            <div className="pdf-grid-2"><div className="pdf-card" style={{ boxShadow: "none" }}><p className="pdf-card-label">Illustrative score</p><strong style={{ fontSize: 24 }}>782 / 900</strong></div><div className="pdf-card" style={{ boxShadow: "none" }}><p className="pdf-card-label">On-time</p><strong style={{ fontSize: 24 }}>94% of 72</strong></div></div>
            <p className="pdf-small" style={{ marginTop: 12 }}>Credibility score history<br />741 → 782, Jun – Nov (stacked panel)</p>
            <table className="pdf-table" style={{ minWidth: 0, marginTop: 10 }}><tbody><tr><td>November rent</td><td>18,000</td><td><span className="pdf-pill pdf-pill-success">● On time</span></td></tr><tr><td>Electricity</td><td>2,450</td><td><span className="pdf-pill pdf-pill-warning">● Late</span></td></tr></tbody></table>
          </div>
        </article>

        <article className="pdf-card" style={{ background: "#f4f4f6", color: "#111318" }}>
          <p style={{ color: "#315be6", fontSize: 10, fontWeight: 850, letterSpacing: "0.15em" }}>LIGHT THEME · SCORE CARD</p>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}><span /><span style={{ padding: "6px 10px", borderRadius: 999, background: "#dff8ee", color: "#12613e", fontSize: 10, fontWeight: 800 }}>+12 this month</span></div>
          <div style={{ fontSize: "5rem", letterSpacing: "-0.08em", fontWeight: 900, lineHeight: 0.95 }}>782 <small style={{ fontSize: "0.24em", color: "#6b6b74" }}>/900</small></div>
          <div style={{ height: 5, background: "#dedee5", borderRadius: 999, margin: "20px 0" }}><div style={{ width: "82%", height: "100%", background: "#111318", borderRadius: 999 }} /></div>
          <p style={{ color: "#111318" }}>Payment consistency <strong style={{ float: "right" }}>92/100</strong></p>
          <div style={{ height: 6, background: "#dedee5", borderRadius: 999, margin: "8px 0 16px" }}><div style={{ width: "92%", height: "100%", background: "#4169e1", borderRadius: 999 }} /></div>
          <p style={{ color: "#6b6b74" }}>Synthetic data only. Not a credit bureau score.</p>
        </article>
      </div>

      <div className="pdf-grid-2" style={{ marginTop: 16 }}>
        <article className="pdf-card"><h2>Desktop</h2><p style={{ marginTop: 10 }}>Fixed 240 px sidebar, 4-column KPI grid, two-column dashboard panels, full-width tables.</p><p className="pdf-card-label" style={{ marginTop: 18 }}>Test widths</p><div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>{["320 px", "375 px", "390 px", "768 px", "1024 px", "1440 px"].map((width) => <span key={width} className="pdf-pill">{width}</span>)}</div></article>
        <article className="pdf-card"><h2>Build notes</h2><p style={{ marginTop: 10 }}>Next.js App Router · React · TypeScript · custom CSS design system · SVG charts · reduced-motion support · Zod validation · lucide-react.</p></article>
      </div>
    </section>
  );
}
