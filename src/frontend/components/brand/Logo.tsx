interface LogoProps {
  variant?: "dark" | "light";
  showWordmark?: boolean;
  size?: "sm" | "md";
}

export function Logo({ variant = "dark", showWordmark = true, size = "md" }: LogoProps) {
  return (
    <span className={`logo logo-${variant} logo-${size}`}>
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" role="presentation">
          <rect x="5" y="17" width="5" height="10" rx="2.4" fill="currentColor" opacity="0.55" />
          <rect x="13.5" y="11" width="5" height="16" rx="2.4" fill="currentColor" opacity="0.8" />
          <rect x="22" y="5" width="5" height="22" rx="2.4" fill="currentColor" />
          <circle cx="24.5" cy="5" r="2.2" fill="currentColor" className="logo-dot" />
        </svg>
      </span>
      {showWordmark ? (
        <span className="logo-wordmark">
          Fin<span>Cred</span>
        </span>
      ) : (
        <span className="sr-only">FinCred</span>
      )}
    </span>
  );
}
