"use client";

import {
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleDashed,
  Gauge,
  Layers3,
  Loader2,
  Plus,
  ReceiptText,
  RefreshCw,
  Sparkles,
  Wallet,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/frontend/providers/AuthProvider";
import { CategoryIcon } from "@/frontend/components/ui/CategoryIcon";
import { ClientApiError, apiRequest } from "@/frontend/lib/api";
import {
  CATEGORY_DEFINITIONS,
  PAYMENT_CATEGORIES,
  type PaymentCategory,
} from "@/models/domain";
import { formatCurrency, formatDate } from "@/frontend/lib/format";
import type { TransactionSummaryDto } from "@/models/api";

function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton" aria-hidden="true">
      <div className="skeleton skeleton-heading" />
      <div className="kpi-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="card kpi-card" key={index}>
            <div className="skeleton skeleton-line skeleton-line-sm" />
            <div className="skeleton skeleton-value" />
            <div className="skeleton skeleton-line" />
          </div>
        ))}
      </div>
      <div className="dashboard-grid">
        <div className="card skeleton-card" />
        <div className="card skeleton-card" />
      </div>
    </div>
  );
}

export function DashboardView() {
  const { user } = useAuth();
  const router = useRouter();
  const [summary, setSummary] = useState<TransactionSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fabOpen, setFabOpen] = useState(false);

  const loadSummary = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest<TransactionSummaryDto>("/api/transactions/summary", {
        signal,
      });
      setSummary(data);
    } catch (requestError) {
      if (signal?.aborted) return;
      setError(
        requestError instanceof ClientApiError
          ? requestError.message
          : "The dashboard could not be loaded. Please try again.",
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadSummary(controller.signal);
    return () => controller.abort();
  }, [loadSummary]);

  useEffect(() => {
    if (!fabOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setFabOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("modal-open");
    };
  }, [fabOpen]);

  function chooseCategory(category: PaymentCategory) {
    setFabOpen(false);
    router.push(`/payments/new/${category}`);
  }

  const firstName = (user?.name ?? "there").split(" ")[0];
  const ready = summary?.assessment.ready ?? false;
  const totalAmount = summary?.totals.totalAmount ?? 0;
  const categoriesUsed = summary?.totals.categoriesUsed ?? 0;

  return (
    <div className="page dashboard-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h1>Welcome back, {firstName}.</h1>
          <p className="page-subtitle">
            Here is the latest view of your synthetic payment activity and assessment readiness.
          </p>
        </div>
        <div className="page-actions">
          <Link href="/assessment" className="btn btn-secondary">
            <Gauge size={17} aria-hidden="true" />
            Assessment
          </Link>
          <Link href="/payments/new/rent" className="btn btn-primary">
            <Plus size={17} aria-hidden="true" />
            Add payment
          </Link>
        </div>
      </header>

      {loading ? <DashboardSkeleton /> : null}

      {!loading && error ? (
        <div className="card state-card" role="alert">
          <span className="state-icon state-icon-error">
            <RefreshCw size={22} />
          </span>
          <h2>Dashboard unavailable</h2>
          <p>{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => void loadSummary()}>
            <RefreshCw size={16} aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : null}

      {!loading && !error && summary ? (
        <>
          <section className="kpi-grid" aria-label="Payment overview">
            <article className="card kpi-card">
              <div className="kpi-top">
                <span className="kpi-icon kpi-icon-mint">
                  <Wallet size={18} aria-hidden="true" />
                </span>
                <span className="badge badge-neutral">Synthetic</span>
              </div>
              <p className="kpi-label">Total recorded payments</p>
              <p className="kpi-value">{formatCurrency(totalAmount, 2)}</p>
              <p className="kpi-foot">
                {summary.totals.latestTransactionDate
                  ? `Latest payment ${formatDate(summary.totals.latestTransactionDate)}`
                  : "No payments recorded yet"}
              </p>
            </article>

            <article className="card kpi-card">
              <div className="kpi-top">
                <span className="kpi-icon kpi-icon-blue">
                  <ReceiptText size={18} aria-hidden="true" />
                </span>
              </div>
              <p className="kpi-label">Submitted transactions</p>
              <p className="kpi-value">{summary.totals.transactions}</p>
              <p className="kpi-foot">
                {summary.totals.attachments} synthetic attachment
                {summary.totals.attachments === 1 ? "" : "s"} included
              </p>
            </article>

            <article className="card kpi-card">
              <div className="kpi-top">
                <span className="kpi-icon kpi-icon-amber">
                  <Layers3 size={18} aria-hidden="true" />
                </span>
              </div>
              <p className="kpi-label">Categories covered</p>
              <p className="kpi-value">
                {categoriesUsed}
                <span className="kpi-value-suffix"> / {PAYMENT_CATEGORIES.length}</span>
              </p>
              <div className="mini-category-dots" aria-hidden="true">
                {summary.categories.map((category) => (
                  <span
                    key={category.category}
                    className={`mini-category-dot mini-category-${category.category} ${
                      category.count > 0 ? "filled" : ""
                    }`}
                  />
                ))}
              </div>
              <p className="kpi-foot">Rent, electricity, and mobile bills</p>
            </article>

            <article className="card kpi-card kpi-card-status">
              <div className="kpi-top">
                <span className="kpi-icon kpi-icon-violet">
                  <Gauge size={18} aria-hidden="true" />
                </span>
                <span className={`badge ${ready ? "badge-success" : "badge-warning"}`}>
                  {ready ? "Ready" : "Needs data"}
                </span>
              </div>
              <p className="kpi-label">Assessment status</p>
              <p className="kpi-value kpi-value-sm">
                {ready ? "Ready to generate" : "More history needed"}
              </p>
              <p className="kpi-foot">
                {ready
                  ? "Minimum synthetic data requirements met"
                  : "Add payments across more categories"}
              </p>
            </article>
          </section>

          <div className="dashboard-grid">
            <section className="card category-card">
              <div className="card-header">
                <div>
                  <p className="eyebrow">Category overview</p>
                  <h2>Where your payments sit</h2>
                </div>
                <span className="badge badge-neutral">{summary.totals.transactions} total</span>
              </div>

              <div className="category-overview">
                {summary.categories.map((category) => {
                  const definition = CATEGORY_DEFINITIONS[category.category];
                  const share =
                    totalAmount > 0 ? Math.round((category.amount / totalAmount) * 100) : 0;
                  return (
                    <div className="category-row" key={category.category}>
                      <CategoryIcon category={category.category} />
                      <div className="category-row-main">
                        <div className="category-row-head">
                          <div>
                            <p className="category-row-title">{definition.label}</p>
                            <p className="category-row-meta">
                              {category.count} payment{category.count === 1 ? "" : "s"}
                            </p>
                          </div>
                          <div className="category-row-amount">
                            <strong>{formatCurrency(category.amount)}</strong>
                            <span>{share}% of recorded value</span>
                          </div>
                        </div>
                        <div
                          className={`progress-track progress-${category.category}`}
                          role="progressbar"
                          aria-label={`${definition.label} share of total payment value`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={share}
                        >
                          <span style={{ width: `${share}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="card assessment-cta-card">
              <div className="assessment-cta-glow" aria-hidden="true" />
              <div className="assessment-cta-top">
                <span className="assessment-cta-icon">
                  <Sparkles size={20} aria-hidden="true" />
                </span>
                <span className="badge badge-inverse">
                  {ready ? "Ready" : "Insufficient data"}
                </span>
              </div>
              <h2>{ready ? "Generate your illustrative assessment" : "Build a stronger data picture"}</h2>
              <p>
                {ready
                  ? "Your synthetic payment history meets the demo data requirements. Review a transparent, rules-based scorecard next."
                  : "The reference engine needs at least 3 payments across 2 categories before it can create an illustrative score."}
              </p>

              <ul className="readiness-list">
                {summary.assessment.requirements.map((requirement) => (
                  <li key={requirement.id} className={requirement.met ? "met" : ""}>
                    <span className="readiness-icon" aria-hidden="true">
                      {requirement.met ? <Check size={14} /> : <CircleDashed size={14} />}
                    </span>
                    <span>
                      <strong>{requirement.label}</strong>
                      <span>{requirement.detail}</span>
                    </span>
                  </li>
                ))}
              </ul>

              <div className="assessment-cta-actions">
                <Link href="/assessment" className="btn btn-light">
                  {ready ? "Open assessment" : "View requirements"}
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
                {!ready ? (
                  <Link href="/payments/new/rent" className="btn btn-ghost-inverse">
                    Add payment
                  </Link>
                ) : null}
              </div>
            </section>
          </div>

          <section className="card recent-card">
            <div className="card-header">
              <div>
                <p className="eyebrow">Recent activity</p>
                <h2>Latest synthetic payments</h2>
              </div>
              <Link href="/transactions" className="text-link">
                View all
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </div>

            {summary.recentTransactions.length === 0 ? (
              <div className="empty-state compact">
                <span className="empty-state-icon">
                  <ReceiptText size={22} aria-hidden="true" />
                </span>
                <h3>No payments yet</h3>
                <p>
                  Add a synthetic rent, electricity, or mobile payment to start building your
                  demo history.
                </p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setFabOpen(true)}
                >
                  <Plus size={16} aria-hidden="true" />
                  Add your first payment
                </button>
              </div>
            ) : (
              <div className="activity-list">
                {summary.recentTransactions.map((transaction) => (
                  <div className="activity-row" key={transaction.id}>
                    <CategoryIcon category={transaction.category} />
                    <div className="activity-main">
                      <p>{transaction.description}</p>
                      <span>
                        {formatDate(transaction.transactionDate)} · {transaction.platform}
                      </span>
                    </div>
                    <div className="activity-amount">
                      <strong>{formatCurrency(transaction.amount, 2)}</strong>
                      <span>{CATEGORY_DEFINITIONS[transaction.category].label}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}

      <button
        type="button"
        className={`fab ${fabOpen ? "fab-active" : ""}`}
        onClick={() => setFabOpen((value) => !value)}
        aria-label={fabOpen ? "Close payment category menu" : "Add a synthetic payment"}
        aria-expanded={fabOpen}
        aria-haspopup="dialog"
      >
        {fabOpen ? <X size={26} aria-hidden="true" /> : <Plus size={28} aria-hidden="true" />}
      </button>

      {fabOpen ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setFabOpen(false)}>
          <div
            className="category-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payment-category-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="category-sheet-handle" aria-hidden="true" />
            <div className="category-sheet-header">
              <div>
                <p className="eyebrow">New payment record</p>
                <h2 id="payment-category-title">What did you pay?</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setFabOpen(false)}
                aria-label="Close payment category menu"
              >
                <X size={18} />
              </button>
            </div>
            <p className="category-sheet-lead">
              Choose a category to open its synthetic payment form.
            </p>
            <div className="category-options">
              {PAYMENT_CATEGORIES.map((category) => {
                const definition = CATEGORY_DEFINITIONS[category];
                return (
                  <button
                    key={category}
                    type="button"
                    className={`category-option category-option-${category}`}
                    onClick={() => chooseCategory(category)}
                  >
                    <CategoryIcon category={category} size={22} />
                    <span className="category-option-copy">
                      <strong>{definition.label}</strong>
                      <span>{definition.description}</span>
                    </span>
                    <span className="category-option-arrow" aria-hidden="true">
                      <ArrowRight size={18} />
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="category-sheet-note">
              Use fictional references only. Do not enter real personal or financial information.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
