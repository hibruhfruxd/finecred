"use client";

import {
  ChevronRight,
  Download,
  FileText,
  Inbox,
  Loader2,
  Plus,
  ReceiptText,
  RefreshCw,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useToast } from "@/frontend/providers/ToastProvider";
import { CategoryIcon } from "@/frontend/components/ui/CategoryIcon";
import { ClientApiError, apiRequest, downloadAttachment } from "@/frontend/lib/api";
import {
  CATEGORY_DEFINITIONS,
  CATEGORY_FIELDS,
  PAYMENT_CATEGORIES,
  type PaymentCategory,
} from "@/models/domain";
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatFileSize,
  titleCase,
} from "@/frontend/lib/format";
import type { TransactionDto } from "@/models/api";

type FilterValue = PaymentCategory | "all";

interface TransactionsResponse {
  transactions: TransactionDto[];
  count: number;
}

export function TransactionsView() {
  const { showToast } = useToast();
  const [transactions, setTransactions] = useState<TransactionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [selected, setSelected] = useState<TransactionDto | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const loadTransactions = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    try {
      const data = await apiRequest<TransactionsResponse>("/api/transactions?limit=200", {
        signal,
      });
      setTransactions(data.transactions);
    } catch (requestError) {
      if (signal?.aborted) return;
      setError(
        requestError instanceof ClientApiError
          ? requestError.message
          : "The transaction history could not be loaded.",
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadTransactions(controller.signal);
    return () => controller.abort();
  }, [loadTransactions]);

  useEffect(() => {
    if (!selected) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("modal-open");
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("modal-open");
    };
  }, [selected]);

  const counts = useMemo(() => {
    const base: Record<FilterValue, number> = {
      all: transactions.length,
      rent: 0,
      electricity: 0,
      mobile: 0,
    };
    for (const transaction of transactions) {
      base[transaction.category] += 1;
    }
    return base;
  }, [transactions]);

  const filtered = useMemo(
    () =>
      filter === "all"
        ? transactions
        : transactions.filter((transaction) => transaction.category === filter),
    [filter, transactions],
  );

  const totalAmount = filtered.reduce((total, transaction) => total + transaction.amount, 0);

  async function handleDownload(transaction: TransactionDto) {
    if (!transaction.attachment) return;
    setDownloadingId(transaction.id);
    try {
      await downloadAttachment(
        transaction.attachment.downloadUrl,
        transaction.attachment.filename,
      );
      showToast({
        tone: "info",
        title: "Synthetic sample downloaded",
        message: transaction.attachment.filename,
      });
    } catch (downloadError) {
      showToast({
        tone: "error",
        title: "Download failed",
        message:
          downloadError instanceof ClientApiError
            ? downloadError.message
            : "The attachment could not be downloaded.",
      });
    } finally {
      setDownloadingId(null);
    }
  }

  function metadataLabel(category: PaymentCategory, key: string): string {
    return CATEGORY_FIELDS[category].find((field) => field.name === key)?.label ?? titleCase(key);
  }

  return (
    <div className="transactions-view">
      <section className="card transactions-toolbar">
        <div className="filter-tabs" role="tablist" aria-label="Filter transactions by category">
          {(["all", ...PAYMENT_CATEGORIES] as FilterValue[]).map((value) => {
            const label =
              value === "all" ? "All payments" : CATEGORY_DEFINITIONS[value].label;
            const active = filter === value;
            return (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={active}
                className={`filter-tab ${active ? "active" : ""}`}
                onClick={() => setFilter(value)}
              >
                {value !== "all" ? <CategoryIcon category={value} size={15} /> : null}
                <span>{label}</span>
                <span className="filter-count">{counts[value]}</span>
              </button>
            );
          })}
        </div>
        <div className="transactions-total">
          <span>Shown value</span>
          <strong>{formatCurrency(totalAmount, 2)}</strong>
        </div>
      </section>

      {loading ? (
        <section className="card transactions-card" aria-busy="true">
          <div className="tx-loading">
            {Array.from({ length: 5 }).map((_, index) => (
              <div className="tx-loading-row" key={index}>
                <span className="skeleton skeleton-avatar" />
                <span className="skeleton skeleton-line" />
                <span className="skeleton skeleton-line skeleton-line-sm" />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {!loading && error ? (
        <section className="card state-card" role="alert">
          <span className="state-icon state-icon-error">
            <RefreshCw size={22} />
          </span>
          <h2>Could not load transactions</h2>
          <p>{error}</p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void loadTransactions()}
          >
            <RefreshCw size={16} aria-hidden="true" />
            Try again
          </button>
        </section>
      ) : null}

      {!loading && !error && transactions.length === 0 ? (
        <section className="card empty-state large">
          <span className="empty-state-icon">
            <ReceiptText size={26} aria-hidden="true" />
          </span>
          <h2>No synthetic payments yet</h2>
          <p>
            Add a fictional rent, electricity, or mobile payment to build a payment history and
            unlock the illustrative assessment.
          </p>
          <div className="empty-state-actions">
            {PAYMENT_CATEGORIES.map((category) => (
              <Link
                key={category}
                href={`/payments/new/${category}`}
                className="btn btn-secondary"
              >
                <Plus size={16} aria-hidden="true" />
                Add {CATEGORY_DEFINITIONS[category].label.toLowerCase()}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {!loading && !error && transactions.length > 0 ? (
        <section className="card transactions-card">
          {filtered.length === 0 ? (
            <div className="empty-state compact">
              <span className="empty-state-icon">
                <Inbox size={22} aria-hidden="true" />
              </span>
              <h3>No {filter !== "all" ? CATEGORY_DEFINITIONS[filter].label.toLowerCase() : ""} payments</h3>
              <p>Try another category filter or add a new synthetic payment.</p>
              <Link href={`/payments/new/${filter === "all" ? "rent" : filter}`} className="btn btn-primary">
                <Plus size={16} aria-hidden="true" />
                Add payment
              </Link>
            </div>
          ) : (
            <div className="tx-table" role="table" aria-label="Synthetic payment history">
              <div className="tx-table-head" role="row">
                <span role="columnheader">Category</span>
                <span role="columnheader">Payment</span>
                <span role="columnheader">Date</span>
                <span role="columnheader">Platform</span>
                <span role="columnheader" className="tx-col-amount">
                  Amount
                </span>
                <span role="columnheader" aria-label="Details" />
              </div>
              <div className="tx-table-body" role="rowgroup">
                {filtered.map((transaction) => (
                  <button
                    type="button"
                    role="row"
                    className="tx-row"
                    key={transaction.id}
                    onClick={() => setSelected(transaction)}
                    aria-label={`View ${CATEGORY_DEFINITIONS[transaction.category].label} payment of ${formatCurrency(transaction.amount, 2)} on ${formatDate(transaction.transactionDate)}`}
                  >
                    <span className="tx-cell tx-cell-category" role="cell">
                      <CategoryIcon category={transaction.category} />
                      <span>{CATEGORY_DEFINITIONS[transaction.category].label}</span>
                    </span>
                    <span className="tx-cell tx-cell-main" role="cell">
                      <span className="tx-description">{transaction.description}</span>
                      <span className="tx-reference">
                        {transaction.attachment ? (
                          <>
                            <FileText size={12} aria-hidden="true" />
                            Attachment included
                          </>
                        ) : (
                          "No attachment"
                        )}
                      </span>
                    </span>
                    <span className="tx-cell tx-cell-date" role="cell">
                      <span className="tx-mobile-label">Date</span>
                      {formatDate(transaction.transactionDate)}
                    </span>
                    <span className="tx-cell tx-cell-platform" role="cell">
                      <span className="tx-mobile-label">Platform</span>
                      {transaction.platform}
                    </span>
                    <span className="tx-cell tx-cell-amount" role="cell">
                      <span className="tx-mobile-label">Amount</span>
                      {formatCurrency(transaction.amount, 2)}
                    </span>
                    <span className="tx-cell tx-cell-chevron" aria-hidden="true">
                      <ChevronRight size={17} />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : null}

      {selected ? (
        <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <div
            className="detail-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="transaction-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="detail-panel-header">
              <div className="detail-panel-title">
                <CategoryIcon category={selected.category} size={20} />
                <div>
                  <p className="eyebrow">{CATEGORY_DEFINITIONS[selected.category].label}</p>
                  <h2 id="transaction-detail-title">Payment details</h2>
                </div>
              </div>
              <button
                type="button"
                className="icon-button"
                onClick={() => setSelected(null)}
                aria-label="Close payment details"
              >
                <X size={18} />
              </button>
            </div>

            <div className="detail-amount">
              <span>Amount</span>
              <strong>{formatCurrency(selected.amount, 2)}</strong>
            </div>

            <dl className="detail-list">
              <div>
                <dt>Transaction ID</dt>
                <dd className="mono">{selected.id}</dd>
              </div>
              <div>
                <dt>Transaction date</dt>
                <dd>{formatDate(selected.transactionDate)}</dd>
              </div>
              <div>
                <dt>Payment platform</dt>
                <dd>{selected.platform}</dd>
              </div>
              <div>
                <dt>Description</dt>
                <dd>{selected.description}</dd>
              </div>
              <div>
                <dt>Recorded at</dt>
                <dd>{formatDateTime(selected.createdAt)}</dd>
              </div>
            </dl>

            <div className="detail-section">
              <h3>{CATEGORY_DEFINITIONS[selected.category].label} reference details</h3>
              <dl className="detail-list">
                {Object.entries(selected.metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt>{metadataLabel(selected.category, key)}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="detail-section">
              <h3>Synthetic attachment</h3>
              {selected.attachment ? (
                <div className="attachment-row">
                  <span className="attachment-icon">
                    <FileText size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p>{selected.attachment.filename}</p>
                    <span>
                      {selected.attachment.mimeType} ·{" "}
                      {formatFileSize(selected.attachment.size)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => void handleDownload(selected)}
                    disabled={downloadingId === selected.id}
                  >
                    {downloadingId === selected.id ? (
                      <Loader2 size={15} className="spin" aria-hidden="true" />
                    ) : (
                      <Download size={15} aria-hidden="true" />
                    )}
                    Download
                  </button>
                </div>
              ) : (
                <p className="detail-empty">No synthetic attachment was added to this payment.</p>
              )}
            </div>

            <div className="detail-footer">
              <Link href="/assessment" className="btn btn-primary">
                Generate assessment
              </Link>
              <button type="button" className="btn btn-ghost" onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
