"use client";

import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  ChevronDown,
  ClipboardCheck,
  CreditCard,
  Database,
  FileBarChart,
  FileText,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  ListChecks,
  Loader2,
  LogOut,
  Menu,
  PlusCircle,
  ReceiptText,
  Settings,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/frontend/providers/AuthProvider";
import { useDemoData, SYNTHETIC_BANNER } from "@/frontend/lib/demo-data";
import { ROLE_LABELS, type DemoRole } from "@/models/demo-accounts";
import { Avatar } from "@/frontend/components/finance/ui";
import { FcLogo, ThemeButton } from "@/frontend/components/finance/PublicShell";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
}

const CONSUMER_NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/payments", label: "My Payments", icon: ReceiptText },
      { href: "/payments/new", label: "Add Payment", icon: PlusCircle, exact: true },
      { href: "/score", label: "Credibility Score", icon: Gauge },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/insights", label: "Financial Insights", icon: Sparkles },
      { href: "/reports", label: "Reports", icon: FileBarChart },
      { href: "/notifications", label: "Notifications", icon: Bell },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/consent", label: "Consent & Privacy", icon: ShieldCheck },
      { href: "/profile", label: "Profile", icon: User },
      { href: "/settings", label: "Settings", icon: Settings },
      { href: "/help", label: "Help & Support", icon: HelpCircle },
    ],
  },
];

const LENDER_NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "Workspace",
    items: [
      { href: "/lender/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
      { href: "/lender/applicants", label: "Applicants", icon: Users },
      { href: "/lender/assessments", label: "Assessments", icon: ClipboardCheck },
      { href: "/lender/reports", label: "Reports", icon: FileBarChart },
      { href: "/lender/api", label: "API Documentation", icon: BookOpen },
      { href: "/lender/settings", label: "Settings", icon: Settings },
    ],
  },
];

const ADMIN_NAV: { label: string; items: NavItem[] }[] = [
  {
    label: "Administration",
    items: [
      { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true },
      { href: "/admin/users", label: "Users", icon: Users },
      { href: "/admin/lenders", label: "Lender Organizations", icon: Building2 },
      { href: "/admin/payments", label: "Payment Records", icon: CreditCard },
      { href: "/admin/scoring", label: "Scoring Engine", icon: Gauge },
      { href: "/admin/synthetic-data", label: "Synthetic Data", icon: Database },
      { href: "/admin/reports", label: "Reports", icon: FileBarChart },
      { href: "/admin/consents", label: "Consent Records", icon: ShieldCheck },
      { href: "/admin/audit-logs", label: "Audit Logs", icon: ListChecks },
      { href: "/admin/settings", label: "System Settings", icon: Settings },
    ],
  },
];

const MOBILE_ITEMS: Record<DemoRole, NavItem[]> = {
  consumer: [
    { href: "/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
    { href: "/payments", label: "Payments", icon: ReceiptText },
    { href: "/score", label: "Score", icon: Gauge },
    { href: "/profile", label: "Profile", icon: User },
  ],
  lender: [
    { href: "/lender/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
    { href: "/lender/applicants", label: "Applicants", icon: Users },
    { href: "/lender/assessments", label: "Assessments", icon: ClipboardCheck },
    { href: "/lender/settings", label: "Settings", icon: Settings },
  ],
  admin: [
    { href: "/admin/dashboard", label: "Home", icon: LayoutDashboard, exact: true },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/audit-logs", label: "Audit", icon: ListChecks },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ],
};

const ROLE_CONTEXT: Record<DemoRole, { workspace: string; tag: string }> = {
  consumer: { workspace: "Consumer workspace", tag: "DEMO 01" },
  lender: { workspace: "Demo Lender A", tag: "LENDER / DEMO" },
  admin: { workspace: "Platform administration", tag: "ADMIN / DEMO" },
};

function isActive(pathname: string, item: NavItem) {
  if (item.exact) return pathname === item.href;
  if (item.href === "/payments") return pathname === "/payments" || pathname.startsWith("/payments/");
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout, loggingOut } = useAuth();
  const { notifications } = useDemoData();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  const role = (user?.role as DemoRole) || "consumer";
  const nav = role === "lender" ? LENDER_NAV : role === "admin" ? ADMIN_NAV : CONSUMER_NAV;
  const mobileItems = MOBILE_ITEMS[role];
  const context = ROLE_CONTEXT[role];
  const unread = notifications.filter((item) => !item.read).length;
  const settingsHref = role === "consumer" ? "/settings" : role === "lender" ? "/lender/settings" : "/admin/settings";
  const profileHref = role === "consumer" ? "/profile" : settingsHref;

  const activeLabel =
    nav.flatMap((group) => group.items).find((item) => isActive(pathname, item))?.label ??
    "Finance Credibility";

  useEffect(() => {
    setMenuOpen(false);
    setUserOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handle(event: MouseEvent) {
      if (userRef.current && !userRef.current.contains(event.target as Node)) setUserOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  return (
    <div className={`fc-shell fc-shell-${role}`}>
      <a href="#main-content" className="fc-skip-link">
        Skip to content
      </a>
      {menuOpen ? <div className="fc-sidebar-scrim" onClick={() => setMenuOpen(false)} /> : null}
      <aside className={`fc-sidebar ${menuOpen ? "fc-sidebar-open" : ""}`} aria-label="Workspace sidebar">
        <div className="fc-sidebar-brand">
          <Link href={role === "consumer" ? "/dashboard" : role === "lender" ? "/lender/dashboard" : "/admin/dashboard"}>
            <FcLogo />
          </Link>
          <button
            type="button"
            className="fc-icon-btn fc-sidebar-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        </div>
        <div className="fc-workspace-chip">
          <span className="fc-workspace-icon">
            {role === "consumer" ? <ShieldCheck size={17} /> : role === "lender" ? <Building2 size={17} /> : <Settings size={17} />}
          </span>
          <div>
            <strong>{context.workspace}</strong>
            <span>Synthetic data only</span>
          </div>
          <span className="fc-workspace-tag">{context.tag}</span>
        </div>
        <nav className="fc-sidebar-nav" aria-label="Main navigation">
          {nav.map((group) => (
            <div className="fc-nav-group" key={group.label}>
              <p className="fc-nav-label">{group.label}</p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`fc-nav-link ${active ? "active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon size={17} strokeWidth={1.9} />
                    <span>{item.label}</span>
                    {item.label === "Notifications" && unread > 0 ? (
                      <span className="fc-nav-count">{unread}</span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="fc-sidebar-bottom">
          <div className="fc-sidebar-trust">
            <ShieldCheck size={16} />
            <div>
              <strong>Experimental model</strong>
              <span>FC-DEMO-1.0 · no bureau data</span>
            </div>
          </div>
          <div className="fc-sidebar-user">
            <Avatar name={user?.name ?? "Demo User"} size="sm" tone={role === "admin" ? "violet" : "blue"} />
            <div>
              <strong>{user?.name ?? "Demo User"}</strong>
              <span>{ROLE_LABELS[role]}</span>
            </div>
            <button
              type="button"
              className="fc-icon-btn"
              onClick={() => void logout()}
              aria-label="Sign out"
              title="Sign out"
              disabled={loggingOut}
            >
              {loggingOut ? <Loader2 size={16} className="fc-spin" /> : <LogOut size={16} />}
            </button>
          </div>
        </div>
      </aside>

      <div className="fc-main">
        <header className="fc-topbar">
          <div className="fc-topbar-left">
            <button
              type="button"
              className="fc-icon-btn fc-mobile-toggle"
              onClick={() => setMenuOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={20} />
            </button>
            <div className="fc-topbar-context">
              <span className="fc-topbar-eyebrow">{ROLE_LABELS[role]} / Demo</span>
              <strong>{activeLabel}</strong>
            </div>
          </div>
          <div className="fc-topbar-actions">
            <span className="fc-topbar-status">
              <span className="fc-status-dot" />
              Synthetic workspace
            </span>
            <Link href={role === "consumer" ? "/notifications" : role === "lender" ? "/lender/dashboard" : "/admin/audit-logs"} className="fc-icon-btn fc-bell-btn" aria-label="Notifications">
              <Bell size={18} />
              {unread > 0 ? <span className="fc-bell-dot">{unread}</span> : null}
            </Link>
            <ThemeButton />
            <div className="fc-user-menu-wrap" ref={userRef}>
              <button
                type="button"
                className="fc-user-trigger"
                onClick={() => setUserOpen((value) => !value)}
                aria-expanded={userOpen}
                aria-haspopup="menu"
              >
                <Avatar name={user?.name ?? "Demo User"} size="sm" tone={role === "admin" ? "violet" : "blue"} />
                <span className="fc-user-trigger-text">
                  <strong>{user?.name ?? "Demo User"}</strong>
                  <span>{user?.email}</span>
                </span>
                <ChevronDown size={15} />
              </button>
              {userOpen ? (
                <div className="fc-user-menu" role="menu">
                  <div className="fc-user-menu-head">
                    <strong>{user?.name ?? "Demo User"}</strong>
                    <span>{ROLE_LABELS[role]} · {context.workspace}</span>
                  </div>
                  <Link href={profileHref} role="menuitem">
                    <User size={16} /> Profile
                  </Link>
                  <Link href={settingsHref} role="menuitem">
                    <Settings size={16} /> Settings
                  </Link>
                  <Link href={role === "consumer" ? "/help" : "/lender/api"} role="menuitem">
                    <HelpCircle size={16} /> Help
                  </Link>
                  <button type="button" role="menuitem" onClick={() => void logout()} disabled={loggingOut}>
                    {loggingOut ? <Loader2 size={16} className="fc-spin" /> : <LogOut size={16} />} Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <div className="fc-synthetic-strip fc-synthetic-strip-app">{SYNTHETIC_BANNER}</div>
        <main id="main-content" className="fc-content">
          {children}
        </main>
        <footer className="fc-app-footer">
          <p>
            <strong>Experimental prototype.</strong> All records and assessments are synthetic.
            Not a bureau score, lending decision, or financial advice.
          </p>
          <span>FC-DEMO-1.0 · November 2026</span>
        </footer>
        <nav className="fc-bottom-nav" aria-label="Mobile navigation">
          {mobileItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item);
            return (
              <Link key={item.href} href={item.href} className={active ? "active" : ""} aria-current={active ? "page" : undefined}>
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
