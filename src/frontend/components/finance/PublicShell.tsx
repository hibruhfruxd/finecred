"use client";

import { ArrowRight, Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "@/frontend/providers/ThemeProvider";
import { SYNTHETIC_BANNER } from "@/frontend/lib/demo-data";

const NAV = [
  { href: "/how-it-works", label: "How It Works" },
  { href: "/features", label: "Features" },
  { href: "/for-lenders", label: "For Lenders" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { href: "/how-it-works", label: "How it works" },
      { href: "/features", label: "Features" },
      { href: "/for-lenders", label: "For lenders" },
      { href: "/faq", label: "FAQ" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/disclaimer", label: "Disclaimer" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/disclaimer", label: "Synthetic data" },
    ],
  },
];

export function FcLogo({ size = "md", light = false }: { size?: "sm" | "md"; light?: boolean }) {
  return (
    <span className={`fc-logo ${size === "sm" ? "fc-logo-sm" : ""} ${light ? "fc-logo-light" : ""}`}>
      <span className="fc-logo-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32">
          <rect x="5" y="17" width="5" height="10" rx="2" fill="currentColor" opacity="0.55" />
          <rect x="13.5" y="11" width="5" height="16" rx="2" fill="currentColor" opacity="0.8" />
          <rect x="22" y="5" width="5" height="22" rx="2" fill="currentColor" />
          <circle cx="24.5" cy="5" r="2" fill="currentColor" />
        </svg>
      </span>
      <span className="fc-logo-text">
        <strong>Finance</strong>
        <span>Credibility</span>
      </span>
    </span>
  );
}

export function ThemeButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      className="fc-icon-btn fc-theme-btn"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="fc-public">
      <div className="fc-synthetic-strip fc-synthetic-strip-public">{SYNTHETIC_BANNER}</div>
      <header className="fc-public-header">
        <div className="fc-public-container fc-public-nav">
          <Link href="/" aria-label="Finance Credibility home">
            <FcLogo />
          </Link>
          <nav className="fc-public-links" aria-label="Public navigation">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={pathname === item.href ? "active" : ""}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="fc-public-actions">
            <ThemeButton />
            <Link href="/login" className="fc-btn fc-btn-secondary fc-btn-sm fc-public-login">
              Sign in
            </Link>
            <Link href="/register" className="fc-btn fc-btn-primary fc-btn-sm">
              Get Started <ArrowRight size={15} />
            </Link>
            <button
              type="button"
              className="fc-icon-btn fc-mobile-toggle"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="public-mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {open ? (
          <div className="fc-public-mobile" id="public-mobile-menu">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}>
                {item.label}
              </Link>
            ))}
            <div className="fc-public-mobile-actions">
              <Link href="/login" className="fc-btn fc-btn-secondary">
                Sign in
              </Link>
              <Link href="/register" className="fc-btn fc-btn-primary">
                Get Started
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <main id="main-content">{children}</main>

      <footer className="fc-public-footer">
        <div className="fc-public-container fc-footer-grid">
          <div className="fc-footer-brand">
            <FcLogo />
            <p>
              A transparent, synthetic-data demonstration of how everyday payment responsibility
              can be made visible.
            </p>
            <div className="fc-footer-badge">
              <span className="fc-status-dot" />
              November 2026 experimental prototype
            </div>
          </div>
          {FOOTER_LINKS.map((group) => (
            <div key={group.title} className="fc-footer-col">
              <h3>{group.title}</h3>
              {group.links.map((link) => (
                <Link key={`${group.title}-${link.label}`} href={link.href}>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="fc-public-container fc-footer-bottom">
          <p>© 2026 Finance Credibility. Synthetic demo only. No real financial data.</p>
          <p className="fc-footer-disclaimer">
            Not a credit bureau score, validated risk prediction, or loan approval.
          </p>
        </div>
      </footer>
    </div>
  );
}
