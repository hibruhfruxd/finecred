"use client";

import {
  BarChart3,
  Building2,
  CreditCard,
  Database,
  FileText,
  Gauge,
  LayoutDashboard,
  Menu,
  ReceiptText,
  Settings,
  ShieldCheck,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/frontend/providers/AuthProvider";
import { FcLogo } from "@/frontend/components/finance/PublicShell";
import type { DemoRole } from "@/models/demo-accounts";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const CONSUMER_NAV: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/payments", label: "My payments", icon: ReceiptText },
  { href: "/score", label: "Credibility score", icon: Gauge },
  { href: "/lender", label: "Lender workspace", icon: Building2 },
  { href: "/", label: "Public site", icon: BarChart3 },
];

const LENDER_NAV: NavItem[] = [
  { href: "/lender", label: "Applicants", icon: LayoutDashboard },
  { href: "/lender/reports", label: "Reports", icon: FileText },
  { href: "/lender#access-policy", label: "Access policy", icon: ShieldCheck },
  { href: "/", label: "Public site", icon: Building2 },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/lenders", label: "Lender organizations", icon: Building2 },
  { href: "/admin/payments", label: "Payment records", icon: CreditCard },
  { href: "/admin/scoring", label: "Scoring engine", icon: Gauge },
  { href: "/admin/synthetic-data", label: "Synthetic data", icon: Database },
  { href: "/admin/reports", label: "Reports", icon: FileText },
  { href: "/admin/consents", label: "Consent records", icon: ShieldCheck },
  { href: "/admin/audit-logs", label: "Audit logs", icon: FileText },
  { href: "/admin/settings", label: "System settings", icon: Settings },
];

function activeFor(pathname: string, href: string) {
  const base = href.split("#")[0];
  if (base === "/" || base === "/lender" || base === "/admin" || base === "/dashboard") return pathname === base;
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const role = (user?.role as DemoRole | undefined) ?? "consumer";
  const items = role === "lender" ? LENDER_NAV : role === "admin" ? ADMIN_NAV : CONSUMER_NAV;
  const home = role === "lender" ? "/lender" : role === "admin" ? "/admin" : "/dashboard";
  const workspace = role === "lender" ? "Demo Lender A · organization-scoped" : role === "admin" ? "Admin · server-side role checks" : "Synthetic workspace";
  const routeLabel = pathname.split("/").filter(Boolean).join(" / ").replaceAll("-", " ").toUpperCase() || "OVERVIEW";

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className={`pdf-shell pdf-shell-${role}`}>
      <a href="#main-content" className="pdf-skip-link">Skip to content</a>
      <aside className={`pdf-sidebar ${open ? "open" : ""}`} aria-label="Workspace navigation">
        <div className="pdf-sidebar-top">
          <Link href={home} aria-label="Finance Credibility home">
            <FcLogo />
          </Link>
          <button type="button" className="pdf-icon-btn pdf-sidebar-close" onClick={() => setOpen(false)} aria-label="Close navigation">
            <X size={18} />
          </button>
        </div>

        <nav className="pdf-nav" aria-label="Main navigation">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activeFor(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`pdf-nav-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={16} strokeWidth={1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="pdf-sidebar-bottom">
          <div className="pdf-sidebar-meta">
            <strong>{workspace}</strong>
            <span>Demo build · FC-DEMO-1.0</span>
          </div>
        </div>
      </aside>

      <div className="pdf-main">
        <header className="pdf-route-bar">
          <button type="button" className="pdf-icon-btn pdf-mobile-toggle" onClick={() => setOpen(true)} aria-label="Open navigation" style={{ display: "none", marginRight: "auto" }}>
            <Menu size={19} />
          </button>
          <span>/ {routeLabel}</span>
          <span className="pdf-route-pill">Synthetic data only</span>
        </header>

        <main id="main-content" className="pdf-content">
          {children}
        </main>

        <footer className="pdf-footer-disclaimer" role="note">
          <span className="dot" />
          <span>Synthetic data only · Experimental assessment · Not a credit bureau score · No loan approval or default prediction.</span>
        </footer>
      </div>
    </div>
  );
}
