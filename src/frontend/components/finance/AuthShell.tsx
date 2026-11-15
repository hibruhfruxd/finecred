import type { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode; eyebrow?: string; title?: string; description?: string; footer?: ReactNode }) {
  return (
    <main className="pdf-auth-page">
      <div className="pdf-auth-inner">
        <div className="pdf-auth-topline">
          <span>/ login · / register · / forgot-password · / reset-password</span>
          <span>Errors never reveal whether an email exists.</span>
        </div>
        <div style={{ minHeight: "calc(100vh - 44px)", display: "grid", placeItems: "center", padding: "28px 0 76px" }}>
          <div style={{ width: "min(365px, 100%)" }}>{children}</div>
        </div>
      </div>
      <div className="pdf-footer-disclaimer" style={{ left: 0 }} role="note">
        <span className="dot" />
        <span>Synthetic data only · Experimental assessment · Not a credit bureau score · No loan approval or default prediction.</span>
      </div>
    </main>
  );
}
