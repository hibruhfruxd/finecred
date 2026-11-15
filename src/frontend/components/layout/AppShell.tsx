"use client";

import {
  FileText,
  Gauge,
  LayoutDashboard,
  Loader2,
  LogOut,
  PlusCircle,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Logo } from "@/frontend/components/brand/Logo";
import { useAuth } from "@/frontend/providers/AuthProvider";
import { initials } from "@/frontend/lib/format";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, match: "exact" },
  { href: "/payments/new/rent", label: "Add payment", icon: PlusCircle, match: "prefix" },
  { href: "/transactions", label: "Transactions", icon: ReceiptText, match: "prefix" },
  { href: "/assessment", label: "Assessment", icon: Gauge, match: "prefix" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout, loggingOut } = useAuth();

  function isActive(href: string, match: "exact" | "prefix") {
    if (match === "exact") return pathname === href;
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const displayName = user?.name ?? "Demo user";
  const displayRole = user?.role ?? "Demo analyst";

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <aside className="sidebar">
        <div className="sidebar-brand">
          <Logo variant="light" />
          <span className="sidebar-env">Prototype</span>
        </div>

        <div className="sidebar-workspace">
          <span className="workspace-mark" aria-hidden="true">
            <ShieldCheck size={16} />
          </span>
          <div>
            <p>Demo workspace</p>
            <span>Synthetic data only</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <p className="sidebar-nav-label">Workspace</p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`sidebar-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={18} strokeWidth={1.9} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />

        <div className="sidebar-callout">
          <p className="sidebar-callout-title">Illustrative prototype</p>
          <p>
            Scores are generated from synthetic demo data and are not credit scores or lending
            decisions.
          </p>
          <Link href="/docs" className="sidebar-callout-link">
            <FileText size={14} aria-hidden="true" />
            API documentation
          </Link>
        </div>

        <div className="sidebar-user">
          <span className="avatar" aria-hidden="true">
            {initials(displayName)}
          </span>
          <div className="sidebar-user-meta">
            <p>{displayName}</p>
            <span>{displayRole}</span>
          </div>
          <button
            type="button"
            className="icon-button icon-button-dark"
            onClick={() => void logout()}
            aria-label="Sign out"
            title="Sign out"
            disabled={loggingOut}
          >
            {loggingOut ? (
              <Loader2 size={16} className="spin" />
            ) : (
              <LogOut size={16} />
            )}
          </button>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div className="topbar-mobile-brand">
            <Logo size="sm" />
          </div>
          <div className="topbar-context">
            <span className="topbar-status">
              <span className="status-dot" />
              Demo environment
            </span>
            <span className="topbar-separator" aria-hidden="true" />
            <span className="topbar-muted">Synthetic payment data</span>
          </div>
          <div className="topbar-actions">
            <span className="topbar-user">
              <span className="avatar avatar-sm" aria-hidden="true">
                {initials(displayName)}
              </span>
              <span className="topbar-user-meta">
                <strong>{displayName}</strong>
                <span>{user?.email ?? "demo@fincred.app"}</span>
              </span>
            </span>
            <button
              type="button"
              className="icon-button"
              onClick={() => void logout()}
              aria-label="Sign out"
              title="Sign out"
              disabled={loggingOut}
            >
              {loggingOut ? (
                <Loader2 size={17} className="spin" />
              ) : (
                <LogOut size={17} />
              )}
            </button>
          </div>
        </header>

        <main id="main-content" className="app-content">
          {children}
        </main>

        <footer className="app-footer">
          <p>
            <strong>Prototype only.</strong> FinCred uses fictional accounts and synthetic payment
            records. Illustrative assessments are not credit scores, lending decisions, or
            validated financial assessments.
          </p>
          <Link href="/docs">API docs</Link>
        </footer>

        <nav className="mobile-nav" aria-label="Mobile navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mobile-nav-link ${active ? "active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={20} strokeWidth={1.9} aria-hidden="true" />
                <span>{item.label === "Add payment" ? "Add" : item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
