"use client";

import {
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronRight,
  Info,
  Loader2,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  useEffect,
  useId,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

type Tone = "neutral" | "blue" | "green" | "amber" | "red" | "violet" | "slate";

export function Badge({
  children,
  tone = "neutral",
  dot = false,
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
}) {
  return (
    <span className={`fc-badge fc-badge-${tone}`}>
      {dot ? <span className="fc-badge-dot" aria-hidden="true" /> : null}
      {children}
    </span>
  );
}

const STATUS_TONES: Record<string, Tone> = {
  "Paid on time": "green",
  "Paid late": "amber",
  Pending: "amber",
  Upcoming: "blue",
  Active: "green",
  Authorized: "green",
  Complete: "green",
  Granted: "green",
  Ready: "green",
  Enabled: "green",
  "Expiring soon": "amber",
  Paused: "amber",
  Disabled: "red",
  Withdrawn: "red",
  "Insufficient data": "slate",
  "No assessment": "slate",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge tone={STATUS_TONES[status] ?? "neutral"} dot>
      {status}
    </Badge>
  );
}

export function Card({
  children,
  className = "",
  as: Tag = "section",
}: {
  children: ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  return <Tag className={`fc-card ${className}`.trim()}>{children}</Tag>;
}

export function CardHeader({
  title,
  description,
  action,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="fc-card-header">
      <div>
        {eyebrow ? <p className="fc-eyebrow">{eyebrow}</p> : null}
        <h2 className="fc-card-title">{title}</h2>
        {description ? <p className="fc-card-description">{description}</p> : null}
      </div>
      {action ? <div className="fc-card-action">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="fc-page-header">
      <div className="fc-page-heading">
        {eyebrow ? <p className="fc-eyebrow">{eyebrow}</p> : null}
        <h1>{title}</h1>
        {description ? <p className="fc-page-description">{description}</p> : null}
        {meta ? <div className="fc-page-meta">{meta}</div> : null}
      </div>
      {actions ? <div className="fc-page-actions">{actions}</div> : null}
    </header>
  );
}

export function StatCard({
  label,
  value,
  detail,
  icon,
  tone = "blue",
  trend,
  href,
}: {
  label: string;
  value: ReactNode;
  detail?: string;
  icon?: ReactNode;
  tone?: Tone;
  trend?: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="fc-stat-top">
        <span className={`fc-stat-icon fc-tone-${tone}`}>{icon}</span>
        {trend ? <span className="fc-stat-trend">{trend}</span> : null}
      </div>
      <p className="fc-stat-label">{label}</p>
      <p className="fc-stat-value">{value}</p>
      {detail ? <p className="fc-stat-detail">{detail}</p> : null}
      {href ? (
        <span className="fc-stat-link">
          View details <ChevronRight size={14} />
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className="fc-card fc-stat-card fc-stat-link-card">
        {content}
      </Link>
    );
  }

  return <div className="fc-card fc-stat-card">{content}</div>;
}

export function ScoreGauge({
  score,
  max = 900,
  min = 300,
  size = "lg",
  caption,
}: {
  score: number | null;
  max?: number;
  min?: number;
  size?: "sm" | "md" | "lg";
  caption?: string;
}) {
  const dimension = size === "lg" ? 208 : size === "md" ? 148 : 104;
  const stroke = size === "lg" ? 14 : size === "md" ? 11 : 8;
  const radius = (dimension - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = score === null ? 0 : Math.max(0, Math.min(1, (score - min) / (max - min)));
  const dash = circumference * ratio * 0.75;

  return (
    <div className={`fc-gauge fc-gauge-${size}`} role="img" aria-label={score === null ? "Score unavailable: insufficient data" : `Illustrative score ${score} out of ${max}`}>
      <svg viewBox={`0 0 ${dimension} ${dimension}`} aria-hidden="true">
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="var(--fc-border)"
          strokeWidth={stroke}
          strokeDasharray={`${circumference * 0.75} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(135 ${dimension / 2} ${dimension / 2})`}
        />
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="url(#fc-gauge-gradient)"
          strokeWidth={stroke}
          strokeDasharray={`${dash} ${circumference}`}
          strokeLinecap="round"
          transform={`rotate(135 ${dimension / 2} ${dimension / 2})`}
          className="fc-gauge-progress"
        />
        <defs>
          <linearGradient id="fc-gauge-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>
      </svg>
      <div className="fc-gauge-center">
        <span className="fc-gauge-score">{score ?? "—"}</span>
        <span className="fc-gauge-range">of {max}</span>
        {caption ? <span className="fc-gauge-caption">{caption}</span> : null}
      </div>
    </div>
  );
}

export function ProgressBar({
  value,
  tone = "blue",
  label,
}: {
  value: number;
  tone?: Tone;
  label?: string;
}) {
  return (
    <div className="fc-progress-wrap">
      {label ? (
        <div className="fc-progress-meta">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      ) : null}
      <div
        className="fc-progress"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <span className={`fc-progress-fill fc-tone-bg-${tone}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function Avatar({
  name,
  size = "md",
  tone = "blue",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
  tone?: Tone;
}) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : parts[0]?.slice(0, 2) ?? "FC";
  return (
    <span className={`fc-avatar fc-avatar-${size} fc-tone-${tone}`} aria-hidden="true">
      {initials.toUpperCase()}
    </span>
  );
}

export function InfoNote({
  children,
  tone = "blue",
  title,
  icon,
}: {
  children: ReactNode;
  tone?: "blue" | "amber" | "green" | "red" | "neutral";
  title?: string;
  icon?: ReactNode;
}) {
  const defaultIcon =
    tone === "amber" || tone === "red" ? (
      <AlertTriangle size={18} />
    ) : tone === "green" ? (
      <Check size={18} />
    ) : (
      <Info size={18} />
    );
  return (
    <div className={`fc-note fc-note-${tone}`}>
      <span className="fc-note-icon">{icon ?? defaultIcon}</span>
      <div>
        {title ? <strong>{title}</strong> : null}
        <div className="fc-note-body">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="fc-empty">
      {icon ? <span className="fc-empty-icon">{icon}</span> : null}
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.classList.add("fc-modal-open");
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.classList.remove("fc-modal-open");
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fc-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        className={`fc-modal fc-modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="fc-modal-head">
          <div>
            <h2 id={titleId}>{title}</h2>
            {description ? <p>{description}</p> : null}
          </div>
          <button type="button" className="fc-icon-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>
        <div className="fc-modal-body">{children}</div>
        {footer ? <div className="fc-modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  tone = "danger",
  busy = false,
  children,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  busy?: boolean;
  children?: ReactNode;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <button type="button" className="fc-btn fc-btn-secondary" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button
            type="button"
            className={`fc-btn ${tone === "danger" ? "fc-btn-danger" : "fc-btn-primary"}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? <Loader2 size={16} className="fc-spin" /> : null}
            {confirmLabel}
          </button>
        </>
      }
    >
      {children}
    </Modal>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder,
  label = "Search",
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="fc-search">
      <Search size={16} aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        {...props}
      />
    </label>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`fc-btn fc-btn-${variant} ${size === "sm" ? "fc-btn-sm" : ""} ${className}`.trim()}
    >
      {children}
    </Link>
  );
}

export function ActionButton({
  children,
  variant = "secondary",
  size = "md",
  icon,
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md";
  icon?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`fc-btn fc-btn-${variant} ${size === "sm" ? "fc-btn-sm" : ""} ${className}`.trim()}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export function TrendArrow({ direction = "up" }: { direction?: "up" | "down" }) {
  return (
    <span className={`fc-trend-arrow fc-trend-${direction}`} aria-hidden="true">
      <ArrowUpRight size={14} style={direction === "down" ? { transform: "rotate(90deg)" } : undefined} />
    </span>
  );
}

export function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="fc-section-title">
      <div>
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
