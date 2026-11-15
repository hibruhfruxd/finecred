"use client";

import { Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { useTheme } from "@/frontend/providers/ThemeProvider";

const NAV = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#for-lenders", label: "For lenders" },
  { href: "/#trust", label: "Trust" },
  { href: "/login", label: "Demo" },
];

const FOOTER_LINKS = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/methodology", label: "Methodology" },
  { href: "/contact", label: "Contact" },
];

export function FcLogo({ size = "md" }: { size?: "sm" | "md"; light?: boolean }) {
  return (
    <span className={`pdf-logo ${size === "sm" ? "pdf-logo-sm" : ""}`}>
      <span className="pdf-logo-mark" aria-hidden="true">
        FC
      </span>
      <span className="pdf-logo-text">Finance Credibility</span>
    </span>
  );
}

export function ThemeButton() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      type="button"
      className="pdf-icon-btn"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

export function PublicShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="pdf-public">
      <header className="pdf-public-header">
        <div className="pdf-public-container pdf-public-nav">
          <Link href="/" aria-label="Finance Credibility home">
            <FcLogo />
          </Link>
          <nav className="pdf-public-links" aria-label="Public navigation">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="pdf-public-actions">
            <ThemeButton />
            <Link href="/login" className="pdf-btn pdf-btn-primary pdf-btn-sm">
              Get started
            </Link>
            <button
              type="button"
              className="pdf-icon-btn pdf-mobile-toggle"
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
          <div className="pdf-mobile-menu" id="public-mobile-menu">
            {NAV.map((item) => <Link key={item.href} href={item.href}>{item.label}</Link>)}
          </div>
        ) : null}
      </header>

      <main id="main-content">{children}</main>

      <footer className="pdf-public-container pdf-public-footer-new">
        <div>
          <FcLogo />
          <p>
            Finance Credibility is an experimental, synthetic-data demonstration. It does not replace a credit
            bureau and does not approve or reject loans.
          </p>
        </div>
        <nav className="pdf-footer-links" aria-label="Footer navigation">
          {FOOTER_LINKS.map((link) => <Link key={link.href} href={link.href}>{link.label}</Link>)}
        </nav>
      </footer>

      <div className="pdf-footer-disclaimer" role="note">
        <span className="dot" />
        <span>Synthetic data only · Experimental assessment · Not a credit bureau score · No loan approval or default prediction.</span>
      </div>
    </div>
  );
}
