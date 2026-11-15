"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  Download,
  FileBarChart,
  FileText,
  Gauge,
  HelpCircle,
  Info,
  Lightbulb,
  Loader2,
  LockKeyhole,
  Mail,
  Pencil,
  Plus,
  Printer,
  ReceiptText,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  UserRound,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  ActionButton,
  Badge,
  ButtonLink,
  Card,
  CardHeader,
  ConfirmDialog,
  EmptyState,
  InfoNote,
  Modal,
  PageHeader,
  ProgressBar,
  ScoreGauge,
  SearchInput,
  SectionTitle,
  StatCard,
  StatusBadge,
} from "@/frontend/components/finance/ui";
import {
  CategoryDonut,
  PaymentActivityChart,
  ScoreTrendChart,
} from "@/frontend/components/finance/charts";
import {
  ASSESSMENT_DATE,
  CATEGORY_LABELS,
  DEMO_ANALYTICS,
  DEMO_CATEGORY_DATA,
  DEMO_INDICATORS,
  DEMO_INSIGHTS,
  DEMO_MODEL,
  DEMO_PAYMENTS,
  DEMO_REPORTS,
  DEMO_SCORE_HISTORY,
  PAYMENT_STATUS_LABELS,
  SYNTHETIC_BANNER,
  derivePaymentStatus,
  downloadTextFile,
  formatDemoDate,
  formatInr,
  formatShortDate,
  reportCsvReport,
  useDemoData,
  type DemoCategory,
  type DemoPayment,
} from "@/frontend/lib/demo-data";
import { useAuth } from "@/frontend/providers/AuthProvider";
import { useTheme } from "@/frontend/providers/ThemeProvider";
import { useToast } from "@/frontend/providers/ToastProvider";

const MONTH_OPTIONS = Array.from(new Set(DEMO_PAYMENTS.map((payment) => payment.billingPeriod))).reverse();

function paymentSort(a: DemoPayment, b: DemoPayment) {
  return b.dueDate.localeCompare(a.dueDate);
}

function ConsumerPageMeta() {
  return (
    <>
      <Badge tone="blue" dot>Synthetic workspace</Badge>
      <span className="fc-meta-sep">·</span>
      <span>Assessment date 11 Nov 2026</span>
    </>
  );
}

export function ConsumerDashboardPage() {
  const { profile, payments, notifications } = useDemoData();
  const recent = useMemo(
    () => [...payments].sort(paymentSort).slice(0, 5),
    [payments],
  );
  const unread = notifications.filter((item) => !item.read).length;
  const upcoming = payments.filter((payment) => derivePaymentStatus(payment) === "upcoming").length;

  return (
    <div className="fc-page">
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back, ${profile.displayName}`}
        description="Here is your synthetic payment story at a glance."
        meta={<ConsumerPageMeta />}
        actions={
          <>
            <ButtonLink href="/payments/new" variant="primary"><Plus size={16} /> Add payment</ButtonLink>
            <ButtonLink href="/score" variant="secondary">View score</ButtonLink>
          </>
        }
      />

      <div className="fc-stat-grid">
        <StatCard label="Illustrative score" value="782" detail="300–900 · +12 vs previous" icon={<Gauge size={20} />} trend="+12" tone="blue" href="/score" />
        <StatCard label="On-time payment rate" value="94%" detail="Of 72 recorded payments" icon={<CheckCircle2 size={20} />} tone="green" href="/analytics" />
        <StatCard label="Monthly obligations" value={formatInr(24_850)} detail="Recorded recurring bills" icon={<WalletCards size={20} />} tone="violet" href="/payments" />
        <StatCard label="Payment records" value="72" detail="12 months of coverage" icon={<ReceiptText size={20} />} tone="amber" href="/payments" />
      </div>

      <div className="fc-dashboard-grid">
        <Card className="fc-span-2">
          <CardHeader
            title="Credibility score history"
            description="Illustrative values over the last six assessments."
            action={<Badge tone="green">+12 this month</Badge>}
          />
          <ScoreTrendChart data={DEMO_SCORE_HISTORY} />
        </Card>
        <Card>
          <CardHeader title="Payment categories" description="Recorded synthetic obligations." />
          <CategoryDonut data={DEMO_CATEGORY_DATA} />
        </Card>
      </div>

      <div className="fc-dashboard-grid fc-dashboard-lower">
        <Card className="fc-span-2">
          <CardHeader
            title="Recent activity"
            description="Latest synthetic records and derived statuses."
            action={<Link href="/payments" className="fc-text-link">View all <ArrowRight size={14} /></Link>}
          />
          <div className="fc-table-wrap">
            <table className="fc-table">
              <thead><tr><th>Payment</th><th>Amount</th><th>Due date</th><th>Status</th><th><span className="sr-only">View</span></th></tr></thead>
              <tbody>
                {recent.map((payment) => (
                  <tr key={payment.id}>
                    <td><Link href={`/payments/${payment.id}`} className="fc-table-title"><span className={`fc-category-dot fc-category-${payment.category}`} />{payment.title}</Link></td>
                    <td className="fc-amount">{formatInr(payment.amount)}</td>
                    <td>{formatDemoDate(payment.dueDate)}</td>
                    <td><StatusBadge status={PAYMENT_STATUS_LABELS[derivePaymentStatus(payment)]} /></td>
                    <td><Link href={`/payments/${payment.id}`} className="fc-icon-btn" aria-label={`View ${payment.title}`}><ChevronRight size={16} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="fc-stack">
          <Card>
            <CardHeader title="Assessment confidence" description="This is coverage, not a lending judgment." />
            <div className="fc-coverage-ring-row">
              <div className="fc-coverage-ring"><strong>100%</strong><span>coverage</span></div>
              <div>
                <p><strong>12</strong> observed months</p>
                <p><strong>72</strong> synthetic records</p>
                <p><strong>4</strong> active categories</p>
              </div>
            </div>
            <Link href="/score" className="fc-text-link">See full explanation <ArrowRight size={14} /></Link>
          </Card>
          <Card>
            <CardHeader title="Keep it current" description="Two small actions make the demo complete." />
            <div className="fc-action-list">
              <Link href="/payments/new" className="fc-action-row"><span><Plus size={16} /></span><div><strong>Add a payment</strong><p>Record a synthetic bill</p></div><ChevronRight size={16} /></Link>
              <Link href="/notifications" className="fc-action-row"><span><Bell size={16} /></span><div><strong>Review notifications</strong><p>{unread} unread · {upcoming} upcoming bill</p></div><ChevronRight size={16} /></Link>
            </div>
          </Card>
        </div>
      </div>

      <InfoNote tone="amber" title="Illustrative assessment only">
        The 782 score is generated from synthetic, self-recorded data. It is not a credit bureau
        score or lending decision. Coverage and model version appear with every assessment.
      </InfoNote>
    </div>
  );
}

export function ConsumerPaymentsPage() {
  const { payments, deletePayment } = useDemoData();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [period, setPeriod] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const pageSize = 10;

  const filtered = useMemo(() => {
    return [...payments]
      .sort(paymentSort)
      .filter((payment) => {
        const paymentStatus = PAYMENT_STATUS_LABELS[derivePaymentStatus(payment)];
        return (
          (category === "all" || payment.category === category) &&
          (period === "all" || payment.billingPeriod === period) &&
          (status === "all" || paymentStatus === status) &&
          (!search ||
            payment.title.toLowerCase().includes(search.toLowerCase()) ||
            CATEGORY_LABELS[payment.category].toLowerCase().includes(search.toLowerCase()))
        );
      });
  }, [payments, category, period, status, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const target = payments.find((payment) => payment.id === deleteId);

  function resetFilters() {
    setSearch("");
    setCategory("all");
    setPeriod("all");
    setStatus("all");
    setPage(1);
  }

  function confirmDelete() {
    if (!deleteId) return;
    deletePayment(deleteId);
    setDeleteId(null);
    showToast({ title: "Payment removed", message: "The synthetic record was deleted from the demo.", tone: "success" });
  }

  return (
    <div className="fc-page">
      <PageHeader
        eyebrow="My payments"
        title="Payment records"
        description="Create, edit, filter, and review synthetic obligations. Dates determine status; recorded settlement determines outcome."
        meta={<ConsumerPageMeta />}
        actions={<ButtonLink href="/payments/new" variant="primary"><Plus size={16} /> Add payment</ButtonLink>}
      />

      <div className="fc-payment-summary">
        <div><span>All records</span><strong>{payments.length}</strong></div>
        <div><span>On time</span><strong>{payments.filter((payment) => derivePaymentStatus(payment) === "paid_on_time").length}</strong></div>
        <div><span>Late</span><strong>{payments.filter((payment) => derivePaymentStatus(payment) === "paid_late").length}</strong></div>
        <div><span>Upcoming</span><strong>{payments.filter((payment) => derivePaymentStatus(payment) === "upcoming").length}</strong></div>
      </div>

      <Card>
        <div className="fc-toolbar">
          <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search payments" />
          <div className="fc-toolbar-filters">
            <label className="fc-filter"><span>Category</span><select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option value="all">All</option>{Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="fc-filter"><span>Period</span><select value={period} onChange={(event) => { setPeriod(event.target.value); setPage(1); }}><option value="all">All</option>{MONTH_OPTIONS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label className="fc-filter"><span>Status</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">All</option>{Object.values(PAYMENT_STATUS_LABELS).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <ActionButton variant="ghost" size="sm" onClick={resetFilters} icon={<RefreshCcw size={14} />}>Reset</ActionButton>
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={<Search size={22} />} title="No synthetic records match" description="Adjust the filters or add a new demo payment." action={<ActionButton variant="secondary" onClick={resetFilters}>Clear filters</ActionButton>} />
        ) : (
          <>
            <div className="fc-table-wrap">
              <table className="fc-table fc-table-payments">
                <thead><tr><th>Title / category</th><th>Amount</th><th>Due / paid</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {rows.map((payment) => {
                    const paymentStatus = derivePaymentStatus(payment);
                    return (
                      <tr key={payment.id}>
                        <td>
                          <Link href={`/payments/${payment.id}`} className="fc-table-title"><span className={`fc-category-dot fc-category-${payment.category}`} />{payment.title}</Link>
                          <span className="fc-table-sub">{CATEGORY_LABELS[payment.category]} · {payment.billingPeriod}</span>
                        </td>
                        <td className="fc-amount">{formatInr(payment.amount)}</td>
                        <td><span className="fc-date-pair">{formatShortDate(payment.dueDate)} <span>/</span> {formatShortDate(payment.paidDate)}</span></td>
                        <td><StatusBadge status={PAYMENT_STATUS_LABELS[paymentStatus]} /></td>
                        <td>
                          <div className="fc-row-actions">
                            <Link href={`/payments/${payment.id}`} className="fc-btn fc-btn-ghost fc-btn-sm">View</Link>
                            <Link href={`/payments/${payment.id}?edit=1`} className="fc-btn fc-btn-ghost fc-btn-sm" aria-label={`Edit ${payment.title}`}><Pencil size={14} /></Link>
                            <button type="button" className="fc-icon-btn fc-icon-btn-danger" onClick={() => setDeleteId(payment.id)} aria-label={`Delete ${payment.title}`}><Trash2 size={15} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="fc-pagination">
              <span>Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}</span>
              <div>
                <button type="button" className="fc-icon-btn" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1} aria-label="Previous page"><ChevronLeft size={16} /></button>
                <span>Page {currentPage} of {totalPages}</span>
                <button type="button" className="fc-icon-btn" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages} aria-label="Next page"><ChevronRight size={16} /></button>
              </div>
            </div>
          </>
        )}
      </Card>
      <p className="fc-section-footnote">Demo records only. Do not enter real financial or identity information.</p>

      <ConfirmDialog
        open={Boolean(deleteId)}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete this synthetic payment?"
        description="This removes the record from your local demo. It does not affect any real system."
        confirmLabel="Delete payment"
      >
        {target ? <div className="fc-confirm-target"><strong>{target.title}</strong><span>{formatInr(target.amount)} · {formatDemoDate(target.dueDate)}</span></div> : null}
      </ConfirmDialog>
    </div>
  );
}

interface PaymentDraft {
  title: string;
  category: DemoCategory;
  amount: string;
  dueDate: string;
  paidDate: string;
  billingPeriod: string;
  recurring: boolean;
  method: string;
  notes: string;
}

function PaymentEditor({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: DemoPayment;
  submitLabel: string;
  onSubmit: (payment: Omit<DemoPayment, "id">) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<PaymentDraft>({
    title: initial?.title ?? "",
    category: initial?.category ?? "rent",
    amount: initial ? String(initial.amount) : "",
    dueDate: initial?.dueDate ?? "2026-11-18",
    paidDate: initial?.paidDate ?? "",
    billingPeriod: initial?.billingPeriod ?? "November 2026",
    recurring: initial?.recurring ?? true,
    method: initial?.method ?? "Bank transfer",
    notes: initial?.notes ?? "Synthetic demo record.",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const previewStatus = derivePaymentStatus({
    id: "preview",
    title: draft.title || "Preview",
    category: draft.category,
    amount: Number(draft.amount) || 0,
    dueDate: draft.dueDate || ASSESSMENT_DATE,
    paidDate: draft.paidDate || null,
    billingPeriod: draft.billingPeriod,
    recurring: draft.recurring,
    method: draft.method,
    notes: draft.notes,
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    const next: Record<string, string> = {};
    if (!draft.title.trim()) next.title = "Enter a payment title.";
    if (!draft.dueDate) next.dueDate = "Choose a due date.";
    if (!draft.amount || Number(draft.amount) <= 0) next.amount = "Enter an amount greater than zero.";
    if (draft.paidDate && draft.paidDate < "2024-01-01") next.paidDate = "Enter a valid payment date.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    onSubmit({
      title: draft.title.trim(),
      category: draft.category,
      amount: Number(draft.amount),
      dueDate: draft.dueDate,
      paidDate: draft.paidDate || null,
      billingPeriod: draft.billingPeriod.trim() || "November 2026",
      recurring: draft.recurring,
      method: draft.method,
      notes: draft.notes.trim(),
    });
  }

  return (
    <form className="fc-form" onSubmit={submit} noValidate>
      <div className="fc-form-grid">
        <label className="fc-field"><span>Category</span><select value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value as DemoCategory })}>{Object.entries(CATEGORY_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="fc-field"><span>Title</span><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. November rent" aria-invalid={Boolean(errors.title)} />{errors.title ? <span className="fc-field-error">{errors.title}</span> : null}</label>
      </div>
      <div className="fc-form-grid">
        <label className="fc-field"><span>Amount (INR)</span><input inputMode="decimal" value={draft.amount} onChange={(event) => setDraft({ ...draft, amount: event.target.value })} placeholder="18,000" aria-invalid={Boolean(errors.amount)} />{errors.amount ? <span className="fc-field-error">{errors.amount}</span> : null}</label>
        <label className="fc-field"><span>Billing period</span><input value={draft.billingPeriod} onChange={(event) => setDraft({ ...draft, billingPeriod: event.target.value })} placeholder="November 2026" /></label>
      </div>
      <div className="fc-form-grid">
        <label className="fc-field"><span>Due date</span><input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} aria-invalid={Boolean(errors.dueDate)} />{errors.dueDate ? <span className="fc-field-error">{errors.dueDate}</span> : null}</label>
        <label className="fc-field"><span>Payment date <em>optional</em></span><input type="date" value={draft.paidDate} onChange={(event) => setDraft({ ...draft, paidDate: event.target.value })} />{errors.paidDate ? <span className="fc-field-error">{errors.paidDate}</span> : null}</label>
      </div>
      <div className="fc-form-grid">
        <label className="fc-field"><span>Method</span><select value={draft.method} onChange={(event) => setDraft({ ...draft, method: event.target.value })}><option>Bank transfer</option><option>UPI</option><option>Auto-debit</option><option>Card</option><option>Net banking</option><option>Cash</option></select></label>
        <label className="fc-check fc-check-inline"><input type="checkbox" checked={draft.recurring} onChange={(event) => setDraft({ ...draft, recurring: event.target.checked })} /><span>Recurring monthly obligation</span></label>
      </div>
      <label className="fc-field"><span>Notes <em>optional</em></span><textarea rows={2} value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} /></label>
      <div className="fc-derived-preview">
        <div><span>Derived status</span><StatusBadge status={PAYMENT_STATUS_LABELS[previewStatus]} /></div>
        <p>{draft.paidDate ? `Paid ${formatDemoDate(draft.paidDate)} against a due date of ${formatDemoDate(draft.dueDate)}.` : `No settlement recorded. Due ${formatDemoDate(draft.dueDate)}; missing records are unknown, not missed.`}</p>
      </div>
      <div className="fc-form-actions">
        <ActionButton type="button" variant="secondary" onClick={onCancel}>Cancel</ActionButton>
        <ActionButton type="submit" variant="primary" icon={<Check size={16} />}>{submitLabel}</ActionButton>
      </div>
    </form>
  );
}

export function ConsumerNewPaymentPage() {
  const router = useRouter();
  const { addPayment } = useDemoData();
  const { showToast } = useToast();

  return (
    <div className="fc-page fc-narrow-page">
      <PageHeader
        eyebrow="Add payment"
        title="Record a synthetic payment"
        description="Dates determine the derived status. A missing payment date is unknown, never treated as missed."
        actions={<ButtonLink href="/payments" variant="secondary"><ArrowLeft size={16} /> Back to payments</ButtonLink>}
      />
      <Card>
        <div className="fc-form-card-head">
          <div><p className="fc-eyebrow">Synthetic record</p><h2>Payment details</h2></div>
          <Badge tone="amber" dot>Fictional data only</Badge>
        </div>
        <PaymentEditor
          submitLabel="Save demo payment"
          onCancel={() => router.push("/payments")}
          onSubmit={(payment) => {
            const created = addPayment(payment);
            showToast({ title: "Synthetic payment saved", message: `${created.title} was added to your demo history.`, tone: "success" });
            router.push(`/payments/${created.id}`);
          }}
        />
      </Card>
    </div>
  );
}

export function ConsumerPaymentDetailPage({ id, initialEdit = false }: { id: string; initialEdit?: boolean }) {
  const router = useRouter();
  const { payments, updatePayment, deletePayment } = useDemoData();
  const { showToast } = useToast();
  const [editing, setEditing] = useState(initialEdit);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const payment = payments.find((item) => item.id === id);

  if (!payment) {
    return (
      <div className="fc-page">
        <EmptyState icon={<ReceiptText size={22} />} title="Payment not found" description="This synthetic record may have been deleted or reset." action={<ButtonLink href="/payments" variant="primary">Return to payments</ButtonLink>} />
      </div>
    );
  }

  const status = derivePaymentStatus(payment);
  const statusLabel = PAYMENT_STATUS_LABELS[status];

  return (
    <div className="fc-page fc-narrow-page">
      <PageHeader
        eyebrow="Payment detail"
        title={payment.title}
        description={`${CATEGORY_LABELS[payment.category]} · ${payment.billingPeriod}`}
        meta={<><StatusBadge status={statusLabel} /><span className="fc-meta-sep">·</span><span>Recorded in the synthetic demo</span></>}
        actions={
          <>
            <ButtonLink href="/payments" variant="secondary"><ArrowLeft size={16} /> All payments</ButtonLink>
            <ActionButton variant="primary" icon={<Pencil size={15} />} onClick={() => setEditing(true)}>Edit payment</ActionButton>
          </>
        }
      />
      <div className="fc-detail-grid">
        <Card>
          <div className="fc-detail-amount">
            <span>Recorded amount</span>
            <strong>{formatInr(payment.amount)}</strong>
            <StatusBadge status={statusLabel} />
          </div>
          <dl className="fc-detail-list">
            <div><dt>Category</dt><dd>{CATEGORY_LABELS[payment.category]}</dd></div>
            <div><dt>Billing period</dt><dd>{payment.billingPeriod}</dd></div>
            <div><dt>Due date</dt><dd>{formatDemoDate(payment.dueDate)}</dd></div>
            <div><dt>Payment date</dt><dd>{formatDemoDate(payment.paidDate)}</dd></div>
            <div><dt>Method</dt><dd>{payment.method}</dd></div>
            <div><dt>Recurring</dt><dd>{payment.recurring ? "Yes, monthly" : "No"}</dd></div>
          </dl>
          {payment.notes ? <p className="fc-detail-notes">{payment.notes}</p> : null}
        </Card>
        <div className="fc-stack">
          <Card>
            <CardHeader title="Status derivation" description="Status is derived consistently from the recorded dates." />
            <div className="fc-timeline">
              <div className="complete"><span><Check size={13} /></span><div><strong>Record created</strong><p>Synthetic record added to the demo.</p></div></div>
              <div className="complete"><span><CalendarDays size={13} /></span><div><strong>Due {formatDemoDate(payment.dueDate)}</strong><p>{payment.paidDate ? "A settlement date was recorded." : "No settlement date recorded."}</p></div></div>
              <div className={payment.paidDate ? "complete" : "pending"}><span>{payment.paidDate ? <Check size={13} /> : <Clock3 size={13} />}</span><div><strong>{payment.paidDate ? `Paid ${formatDemoDate(payment.paidDate)}` : "Pending / unknown"}</strong><p>{payment.paidDate ? (status === "paid_late" ? "Settlement was after the due date." : "Settlement was on or before the due date.") : "Not automatically treated as missed."}</p></div></div>
            </div>
          </Card>
          <Card>
            <CardHeader title="Related actions" />
            <div className="fc-action-list">
              <Link href="/score" className="fc-action-row"><span><Gauge size={16} /></span><div><strong>View credibility score</strong><p>See how records are explained</p></div><ChevronRight size={16} /></Link>
              <Link href="/reports" className="fc-action-row"><span><FileText size={16} /></span><div><strong>Download payment history</strong><p>Synthetic CSV report</p></div><ChevronRight size={16} /></Link>
            </div>
            <button type="button" className="fc-btn fc-btn-danger fc-btn-block fc-delete-btn" onClick={() => setConfirmDelete(true)}><Trash2 size={15} /> Delete synthetic payment</button>
          </Card>
        </div>
      </div>

      <Modal
        open={editing}
        onClose={() => setEditing(false)}
        title="Edit synthetic payment"
        description="Changes update this browser's local demo only."
        size="lg"
      >
        <PaymentEditor
          initial={payment}
          submitLabel="Save changes"
          onCancel={() => setEditing(false)}
          onSubmit={(updated) => {
            updatePayment(payment.id, updated);
            setEditing(false);
            showToast({ title: "Payment updated", message: "The derived status has been recalculated.", tone: "success" });
          }}
        />
      </Modal>
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => {
          deletePayment(payment.id);
          showToast({ title: "Payment deleted", tone: "success" });
          router.push("/payments");
        }}
        title="Delete this synthetic payment?"
        description="This removes the record from your local demo. It cannot be undone."
        confirmLabel="Delete payment"
      />
    </div>
  );
}

export function ConsumerScorePage() {
  return (
    <div className="fc-page">
      <PageHeader
        eyebrow="Credibility score"
        title="An illustrative assessment, explained."
        description="Every indicator is derived from recorded synthetic payment behaviour. Coverage and limitations are part of the score, not an afterthought."
        meta={<ConsumerPageMeta />}
        actions={<ButtonLink href="/reports" variant="secondary"><Download size={16} /> Download summary</ButtonLink>}
      />
      <Card className="fc-score-hero">
        <div className="fc-score-hero-main">
          <ScoreGauge score={782} size="lg" caption="+12 vs previous" />
          <div className="fc-score-hero-copy">
            <Badge tone="blue" dot>Illustrative credibility assessment</Badge>
            <h2>782 <span>/ 900</span></h2>
            <p>Up 12 points from the previous assessment. Model version {DEMO_MODEL}.</p>
            <div className="fc-score-meta-grid">
              <div><span>Coverage</span><strong>12 observed months</strong></div>
              <div><span>Records</span><strong>72 synthetic payments</strong></div>
              <div><span>Categories</span><strong>4 active categories</strong></div>
              <div><span>Assessment date</span><strong>11 Nov 2026</strong></div>
            </div>
          </div>
        </div>
        <div className="fc-score-hero-side">
          <div className="fc-score-side-block"><span>What helps</span><p>High recorded punctuality and complete coverage.</p></div>
          <div className="fc-score-side-block"><span>Review</span><p>Two payments were recorded after their due dates.</p></div>
          <div className="fc-score-side-block"><span>Unknown, not missed</span><p>Missing records are excluded from indicator denominators.</p></div>
        </div>
      </Card>

      <div className="fc-dashboard-grid">
        <Card className="fc-span-2">
          <CardHeader title="Indicator breakdown" description="Values are normalized and weighted by the illustrative model." action={<Badge tone="blue">{DEMO_MODEL}</Badge>} />
          <div className="fc-indicator-grid">
            {DEMO_INDICATORS.map((indicator) => (
              <div key={indicator.name} className="fc-indicator-card">
                <div><span>{indicator.name}</span><strong>{indicator.value}<small>/100</small></strong></div>
                <ProgressBar value={indicator.value} tone={indicator.value >= 90 ? "green" : indicator.value >= 80 ? "blue" : "amber"} />
                <span className="fc-indicator-weight">Weight {indicator.weight}</span>
              </div>
            ))}
          </div>
        </Card>
        <div className="fc-stack">
          <Card>
            <CardHeader title="Score history" description="Six recent assessments." />
            <ScoreTrendChart data={DEMO_SCORE_HISTORY} height={190} />
          </Card>
          <InfoNote tone="amber" title="Experimental limitations">
            Self-recorded synthetic data. No external verification. Not a bureau score, default
            prediction, or loan eligibility measure.
          </InfoNote>
        </div>
      </div>

      <Card>
        <CardHeader title="Score calculation context" description="The demo uses an illustrative aggregation contract." />
        <div className="fc-score-context">
          <div><span>Model</span><strong>FC-DEMO-1.0</strong><p>Versioned design fixture</p></div>
          <div><span>Formula</span><strong>300 + 600 × score</strong><p>Weighted normalized indicators</p></div>
          <div><span>Minimum data</span><strong>6 records, 3 months</strong><p>Otherwise score is withheld</p></div>
          <div><span>Input integrity</span><strong>Immutable snapshot</strong><p>Changes create a new assessment</p></div>
        </div>
      </Card>
    </div>
  );
}

export function ConsumerAnalyticsPage() {
  const [range, setRange] = useState("12");
  const [customOpen, setCustomOpen] = useState(false);
  const months = Number(range);
  const data = months === 1 ? DEMO_ANALYTICS.slice(-1) : DEMO_ANALYTICS.slice(-months);
  const totals = data.reduce((acc, item) => ({ onTime: acc.onTime + item.onTime, late: acc.late + item.late, pending: acc.pending + item.pending }), { onTime: 0, late: 0, pending: 0 });
  const total = totals.onTime + totals.late + totals.pending;
  const rate = total ? Math.round((totals.onTime / total) * 100) : 0;

  return (
    <div className="fc-page">
      <PageHeader
        eyebrow="Analytics"
        title="The shape of your payment behaviour."
        description="Explore punctuality, categories, and obligations across the selected synthetic period."
        actions={<ButtonLink href="/reports" variant="secondary"><Download size={16} /> Export report</ButtonLink>}
      />
      <div className="fc-range-bar">
        <div className="fc-range-presets">
          {[["1", "30 days"], ["3", "3 months"], ["6", "6 months"], ["12", "12 months"]].map(([value, label]) => <button type="button" key={value} className={range === value ? "active" : ""} onClick={() => { setRange(value); setCustomOpen(false); }}>{label}</button>)}
          <button type="button" className={customOpen ? "active" : ""} onClick={() => setCustomOpen((value) => !value)}>Custom</button>
        </div>
        <span>Every chart reflects the selected range.</span>
      </div>
      {customOpen ? <Card className="fc-custom-range"><label className="fc-field"><span>From</span><input type="date" defaultValue="2026-06-01" /></label><label className="fc-field"><span>To</span><input type="date" defaultValue="2026-11-11" /></label><ActionButton variant="primary" onClick={() => { setRange("12"); setCustomOpen(false); }}>Apply range</ActionButton></Card> : null}
      <div className="fc-stat-grid">
        <StatCard label="On-time rate" value={`${rate}%`} detail={`${totals.onTime} of ${total} records in range`} icon={<CheckCircle2 size={20} />} tone="green" />
        <StatCard label="Late settlements" value={String(totals.late)} detail="Explicitly paid after due date" icon={<AlertTriangle size={20} />} tone="amber" />
        <StatCard label="Upcoming / pending" value={String(totals.pending)} detail="Unknown, not treated as missed" icon={<Clock3 size={20} />} tone="blue" />
        <StatCard label="Average obligations" value={formatInr(24_850)} detail="Recorded monthly recurring totals" icon={<WalletCards size={20} />} tone="violet" />
      </div>
      <div className="fc-dashboard-grid">
        <Card className="fc-span-2"><CardHeader title="Payment activity" description="Recorded settlement outcomes by month." /><PaymentActivityChart data={data} /></Card>
        <Card><CardHeader title="Category mix" description="Recorded synthetic amount by category." /><CategoryDonut data={DEMO_CATEGORY_DATA} /></Card>
      </div>
      <div className="fc-dashboard-grid">
        <Card>
          <CardHeader title="Monthly obligation pattern" description="Recurring total across the period." />
          <div className="fc-obligation-chart">
            {data.map((item) => <div key={item.month}><span className="fc-obligation-bar"><span style={{ height: `${Math.max(30, (item.amount / 25_000) * 100)}%` }} /></span><strong>{item.month}</strong><small>{formatInr(item.amount)}</small></div>)}
          </div>
        </Card>
        <Card>
          <CardHeader title="What changed" description="Plain-language observations from the selected range." />
          <div className="fc-insight-list">
            {DEMO_INSIGHTS.slice(0, 3).map((insight) => <div key={insight.id} className={`fc-insight-row fc-insight-${insight.tone}`}><span><Lightbulb size={16} /></span><div><strong>{insight.title}</strong><p>{insight.body}</p></div></div>)}
          </div>
          <Link href="/insights" className="fc-text-link">Open financial insights <ArrowRight size={14} /></Link>
        </Card>
      </div>
      <Card>
        <CardHeader title="Monthly data" description="The same values shown in the charts." />
        <div className="fc-table-wrap"><table className="fc-table"><thead><tr><th>Month</th><th>On time</th><th>Late</th><th>Pending</th><th>Obligations</th></tr></thead><tbody>{data.map((item) => <tr key={item.month}><td>{item.month}</td><td>{item.onTime}</td><td>{item.late}</td><td>{item.pending}</td><td className="fc-amount">{formatInr(item.amount)}</td></tr>)}</tbody></table></div>
      </Card>
    </div>
  );
}

export function ConsumerInsightsPage() {
  return (
    <div className="fc-page">
      <PageHeader
        eyebrow="Financial insights"
        title="Signals worth understanding."
        description="These observations are generated from synthetic payment records. They describe patterns, not creditworthiness."
        meta={<ConsumerPageMeta />}
        actions={<ButtonLink href="/score" variant="primary"><Gauge size={16} /> View score explanation</ButtonLink>}
      />
      <div className="fc-insight-cards">
        {DEMO_INSIGHTS.map((insight) => (
          <Card key={insight.id} className={`fc-insight-card fc-insight-card-${insight.tone}`}>
            <div className="fc-insight-card-top"><span className="fc-insight-icon">{insight.tone === "positive" ? <TrendingUp size={20} /> : insight.tone === "warning" ? <AlertTriangle size={20} /> : <Lightbulb size={20} />}</span><Badge tone={insight.tone === "positive" ? "green" : insight.tone === "warning" ? "amber" : insight.tone === "info" ? "blue" : "neutral"}>{insight.metric}</Badge></div>
            <h3>{insight.title}</h3>
            <p>{insight.body}</p>
          </Card>
        ))}
      </div>
      <div className="fc-dashboard-grid">
        <Card>
          <CardHeader title="Suggested next actions" description="Optional ways to keep the demo record complete." />
          <div className="fc-action-list">
            <Link href="/payments/new" className="fc-action-row"><span><Plus size={16} /></span><div><strong>Record the next bill</strong><p>Keep the payment timeline current</p></div><ChevronRight size={16} /></Link>
            <Link href="/consent" className="fc-action-row"><span><ShieldCheck size={16} /></span><div><strong>Review sharing consent</strong><p>Decide who can view the assessment</p></div><ChevronRight size={16} /></Link>
            <Link href="/reports" className="fc-action-row"><span><FileBarChart size={16} /></span><div><strong>Export a summary</strong><p>Download the synthetic evidence</p></div><ChevronRight size={16} /></Link>
          </div>
        </Card>
        <Card>
          <CardHeader title="How to read an insight" />
          <div className="fc-reading-guide">
            <div><Badge tone="green">Positive</Badge><p>An observed pattern that contributes favorably in the illustrative model.</p></div>
            <div><Badge tone="amber">Review</Badge><p>A recorded event worth understanding. It does not automatically mean an adverse decision.</p></div>
            <div><Badge tone="blue">Info</Badge><p>Context about coverage, categories, or consistency. Not a lending recommendation.</p></div>
          </div>
          <InfoNote tone="amber">Insights are not financial advice and do not predict loan outcomes.</InfoNote>
        </Card>
      </div>
    </div>
  );
}

export function ConsumerReportsPage() {
  const { showToast } = useToast();
  const [selected, setSelected] = useState<(typeof DEMO_REPORTS)[number] | null>(null);
  const [type, setType] = useState("all");
  const reports = DEMO_REPORTS.filter((report) => type === "all" || report.type === type);

  function download(report: (typeof DEMO_REPORTS)[number]) {
    downloadTextFile(`finance-credibility-${report.id}.csv`, reportCsvReport(report.title));
    showToast({ title: "Synthetic report downloaded", message: `${report.title} was generated as a CSV.`, tone: "success" });
  }

  return (
    <div className="fc-page">
      <PageHeader
        eyebrow="Reports"
        title="Synthetic reports, ready to review."
        description="Every export includes identity label, assessment date, indicators, coverage, payment summary, and the synthetic disclaimer."
        actions={<Badge tone="amber" dot>Demo exports only</Badge>}
      />
      <div className="fc-filter-pills">
        {["all", "PDF", "CSV"].map((value) => <button type="button" key={value} className={type === value ? "active" : ""} onClick={() => setType(value)}>{value === "all" ? "All reports" : value}</button>)}
      </div>
      <div className="fc-report-grid">
        {reports.map((report) => (
          <Card key={report.id} className="fc-report-card">
            <div className="fc-report-top"><span className="fc-report-icon"><FileText size={21} /></span><Badge tone={report.type === "PDF" ? "violet" : "green"}>{report.type}</Badge></div>
            <h3>{report.title}</h3>
            <p>{report.description}</p>
            <div className="fc-report-meta"><span>{report.period}</span><span>Updated {report.updated}</span></div>
            <div className="fc-report-actions">
              <ActionButton variant="secondary" size="sm" icon={<Printer size={14} />} onClick={() => setSelected(report)}>Preview</ActionButton>
              <ActionButton variant="ghost" size="sm" icon={<Download size={14} />} onClick={() => download(report)}>CSV</ActionButton>
            </div>
          </Card>
        ))}
      </div>
      <InfoNote tone="blue" title="Permissions are part of the report">
        Report access is rechecked at generation in a production design. This demo only creates
        local synthetic files.
      </InfoNote>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? "Report preview"} description="Synthetic report preview. Use Print / Save PDF for a print-ready copy." size="lg" footer={<><ActionButton variant="secondary" onClick={() => setSelected(null)}>Close</ActionButton><ActionButton variant="primary" icon={<Printer size={15} />} onClick={() => window.print()}>Print / Save PDF</ActionButton></>}>
        {selected ? (
          <div className="fc-print-area">
            <div className="fc-report-preview-head"><div><p>Finance Credibility</p><h2>{selected.title}</h2></div><Badge tone="amber">SYNTHETIC</Badge></div>
            <p className="fc-report-disclaimer">{SYNTHETIC_BANNER}</p>
            <div className="fc-report-preview-grid">
              <div><span>Identity label</span><strong>Demo Consumer 001</strong></div>
              <div><span>Assessment date</span><strong>11 Nov 2026</strong></div>
              <div><span>Score</span><strong>782 / 900</strong></div>
              <div><span>Coverage</span><strong>12 months · 72 records</strong></div>
              <div><span>On-time rate</span><strong>94%</strong></div>
              <div><span>Model</span><strong>{DEMO_MODEL}</strong></div>
            </div>
            <table className="fc-table"><thead><tr><th>Indicator</th><th>Value</th><th>Weight</th></tr></thead><tbody>{DEMO_INDICATORS.map((indicator) => <tr key={indicator.name}><td>{indicator.name}</td><td>{indicator.value}/100</td><td>{indicator.weight}</td></tr>)}</tbody></table>
            <p className="fc-report-footnote">Not a credit bureau score, validated risk prediction, or loan approval. Missing records are unknown, not missed.</p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

export function ConsumerNotificationsPage() {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useDemoData();
  const [filter, setFilter] = useState("all");
  const unread = notifications.filter((item) => !item.read).length;
  const rows = notifications.filter((item) => filter === "all" || !item.read);

  return (
    <div className="fc-page">
      <PageHeader
        eyebrow="Notifications"
        title="Updates from your synthetic workspace."
        description="Assessment, payment, consent, and coverage notifications."
        actions={<ActionButton variant="secondary" icon={<Check size={15} />} onClick={() => { markAllNotificationsRead(); }} disabled={unread === 0}>Mark all read</ActionButton>}
      />
      <div className="fc-filter-pills">
        <button type="button" className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>All <span>{notifications.length}</span></button>
        <button type="button" className={filter === "unread" ? "active" : ""} onClick={() => setFilter("unread")}>Unread <span>{unread}</span></button>
      </div>
      <Card>
        {rows.length === 0 ? <EmptyState icon={<CheckCircle2 size={22} />} title="You are all caught up" description="There are no unread synthetic notifications." /> : (
          <div className="fc-notification-list">
            {rows.map((item) => (
              <button type="button" key={item.id} className={`fc-notification-row ${item.read ? "" : "unread"}`} onClick={() => markNotificationRead(item.id)}>
                <span className={`fc-notification-icon fc-notification-${item.category.toLowerCase().replace(/\s/g, "-")}`}><Bell size={17} /></span>
                <span className="fc-notification-main">
                  <span className="fc-notification-top"><strong>{item.title}</strong>{!item.read ? <span className="fc-unread-dot" /> : null}</span>
                  <span>{item.message}</span>
                  <span className="fc-notification-meta">{item.category} · {new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", hour: "numeric", minute: "2-digit" }).format(new Date(item.createdAt))}</span>
                </span>
                {!item.read ? <span className="fc-notification-action">Mark read</span> : <CheckCircle2 size={17} className="fc-read-check" />}
              </button>
            ))}
          </div>
        )}
      </Card>
      <InfoNote tone="blue">Notification preferences can be changed in Settings. This demo does not send email or push messages.</InfoNote>
    </div>
  );
}

export function ConsumerConsentPage() {
  const { consents, setConsentStatus } = useDemoData();
  const { showToast } = useToast();
  const [pending, setPending] = useState<{ id: string; next: "Granted" | "Withdrawn" } | null>(null);
  const current = consents.find((item) => item.id === pending?.id);

  function apply() {
    if (!pending) return;
    setConsentStatus(pending.id, pending.next);
    showToast({ title: pending.next === "Granted" ? "Consent granted" : "Consent withdrawn", message: pending.next === "Withdrawn" ? "New sharing or processing under this purpose is blocked in the demo." : "The synthetic purpose is active again.", tone: "success" });
    setPending(null);
  }

  return (
    <div className="fc-page">
      <PageHeader
        eyebrow="Consent & privacy"
        title="You decide who can view your synthetic assessment."
        description="Processing and lender sharing are separate purposes. Withdrawal takes effect immediately in this demo."
        actions={<ButtonLink href="/reports" variant="secondary"><Download size={16} /> Consent history</ButtonLink>}
      />
      <div className="fc-consent-summary">
        <div><span className="fc-consent-summary-icon"><LockKeyhole size={20} /></span><div><strong>Privacy by default</strong><p>No lender sharing occurs without an explicit purpose-specific grant.</p></div></div>
        <Badge tone="green" dot>Processing active</Badge>
      </div>
      <div className="fc-consent-grid">
        {consents.map((consent) => (
          <Card key={consent.id} className="fc-consent-card">
            <div className="fc-consent-card-top"><span className={`fc-consent-icon ${consent.status === "Granted" ? "granted" : "withdrawn"}`}>{consent.status === "Granted" ? <ShieldCheck size={20} /> : <AlertTriangle size={20} />}</span><StatusBadge status={consent.status} /></div>
            <h3>{consent.purpose}</h3>
            <p>{consent.description}</p>
            <div className="fc-consent-meta"><div><span>Granted</span><strong>{new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(consent.grantedAt))}</strong></div><div><span>Expires</span><strong>{consent.expiresAt}</strong></div></div>
            {consent.status === "Granted" ? (
              <ActionButton variant="secondary" size="sm" onClick={() => setPending({ id: consent.id, next: "Withdrawn" })}>Review / withdraw</ActionButton>
            ) : (
              <ActionButton variant="primary" size="sm" onClick={() => setPending({ id: consent.id, next: "Granted" })}>Grant again</ActionButton>
            )}
          </Card>
        ))}
      </div>
      <div className="fc-dashboard-grid">
        <Card><CardHeader title="Retention" description="What happens to synthetic records." /><div className="fc-retention-list"><div><span>Payment records</span><strong>Until demo reset</strong></div><div><span>Assessments</span><strong>Immutable snapshots</strong></div><div><span>Audit events</span><strong>Local demo only</strong></div><div><span>Session</span><strong>Expires after 8 hours</strong></div></div></Card>
        <Card><CardHeader title="What withdrawal means" /><div className="fc-consent-effects"><div><Check size={16} /><span>New sharing under the withdrawn purpose is blocked.</span></div><div><Check size={16} /><span>Existing synthetic reports in your browser are not deleted.</span></div><div><Check size={16} /><span>You can grant consent again at any time in the demo.</span></div></div><InfoNote tone="amber">This is a product demonstration. No real organization receives data.</InfoNote></Card>
      </div>
      <ConfirmDialog open={Boolean(pending)} onClose={() => setPending(null)} onConfirm={apply} title={pending?.next === "Withdrawn" ? "Withdraw this consent?" : "Grant this consent again?"} description={pending?.next === "Withdrawn" ? "New processing or sharing under this purpose will stop in the demo." : "The synthetic purpose will become active again."} confirmLabel={pending?.next === "Withdrawn" ? "Withdraw consent" : "Grant consent"} tone={pending?.next === "Withdrawn" ? "danger" : "primary"}>
        {current ? <div className="fc-confirm-target"><strong>{current.purpose}</strong><span>{current.description}</span></div> : null}
      </ConfirmDialog>
    </div>
  );
}

export function ConsumerProfilePage() {
  const { profile, updateProfile } = useDemoData();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [draft, setDraft] = useState(profile);

  function save(event: FormEvent) {
    event.preventDefault();
    updateProfile(draft);
    showToast({ title: "Demo profile saved", message: "Your synthetic profile was updated locally.", tone: "success" });
  }

  return (
    <div className="fc-page">
      <PageHeader eyebrow="Profile" title="Your synthetic identity." description="These details are fictional and remain in this browser's demo only." actions={<Badge tone="amber" dot>Synthetic profile</Badge>} />
      <div className="fc-profile-grid">
        <Card className="fc-profile-card">
          <div className="fc-profile-hero"><span className="fc-profile-avatar">{profile.fullName.split(" ").map((part) => part[0]).join("")}</span><div><h2>{profile.fullName}</h2><p>{profile.displayName}</p><div className="fc-profile-badges"><Badge tone="green" dot>Consumer</Badge><Badge tone="blue">Demo account</Badge></div></div></div>
          <div className="fc-profile-facts"><div><span>Email</span><strong>{user?.email ?? profile.email}</strong></div><div><span>Member since</span><strong>{profile.joinedAt}</strong></div><div><span>Location</span><strong>{profile.city}, {profile.state}</strong></div><div><span>Model access</span><strong>FC-DEMO-1.0</strong></div></div>
          <InfoNote tone="blue">No identity verification, document upload, or real KYC is performed.</InfoNote>
        </Card>
        <Card>
          <CardHeader title="Profile details" description="Update the fictional values used across the demo." />
          <form className="fc-form" onSubmit={save}>
            <div className="fc-form-grid"><label className="fc-field"><span>Full name</span><input value={draft.fullName} onChange={(event) => setDraft({ ...draft, fullName: event.target.value })} /></label><label className="fc-field"><span>Display name</span><input value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} /></label></div>
            <div className="fc-form-grid"><label className="fc-field"><span>Demo email</span><input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label><label className="fc-field"><span>Phone</span><input value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label></div>
            <div className="fc-form-grid"><label className="fc-field"><span>City</span><input value={draft.city} onChange={(event) => setDraft({ ...draft, city: event.target.value })} /></label><label className="fc-field"><span>Occupation</span><input value={draft.occupation} onChange={(event) => setDraft({ ...draft, occupation: event.target.value })} /></label></div>
            <label className="fc-field"><span>Demo purpose</span><select value={draft.purpose} onChange={(event) => setDraft({ ...draft, purpose: event.target.value })}><option>Personal financial awareness</option><option>Exploring lender sharing</option><option>Research and product feedback</option></select></label>
            <div className="fc-form-actions"><ActionButton type="button" variant="ghost" onClick={() => setDraft(profile)}>Reset changes</ActionButton><ActionButton type="submit" variant="primary" icon={<Check size={16} />}>Save demo profile</ActionButton></div>
          </form>
        </Card>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className={`fc-switch ${checked ? "on" : ""}`} onClick={() => onChange(!checked)}>
      <span />
    </button>
  );
}

export function ConsumerSettingsPage() {
  const { theme, setTheme } = useTheme();
  const { resetDemoData } = useDemoData();
  const { showToast } = useToast();
  const [preferences, setPreferences] = useState({ payment: true, assessment: true, consent: true, reports: false, reducedMotion: false, compact: false });
  const [currency, setCurrency] = useState("INR");
  const [resetOpen, setResetOpen] = useState(false);

  return (
    <div className="fc-page">
      <PageHeader eyebrow="Settings" title="Shape the demo experience." description="Preferences apply to this browser. No production settings are changed." actions={<ActionButton variant="primary" icon={<Check size={16} />} onClick={() => showToast({ title: "Preferences saved", message: "Your synthetic demo settings were updated locally.", tone: "success" })}>Save preferences</ActionButton>} />
      <div className="fc-settings-grid">
        <Card>
          <CardHeader title="Appearance" description="Light and dark are both designed states." />
          <div className="fc-theme-options">
            <button type="button" className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}><span className="fc-theme-swatch fc-theme-light" /><strong>Light</strong><small>Canvas, navy text</small></button>
            <button type="button" className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}><span className="fc-theme-swatch fc-theme-dark" /><strong>Dark</strong><small>Deep navy surfaces</small></button>
          </div>
          <div className="fc-setting-row"><div><strong>Reduce motion</strong><p>Minimize non-essential transitions.</p></div><Toggle label="Reduce motion" checked={preferences.reducedMotion} onChange={(value) => setPreferences({ ...preferences, reducedMotion: value })} /></div>
          <div className="fc-setting-row"><div><strong>Compact tables</strong><p>Show denser payment rows.</p></div><Toggle label="Compact tables" checked={preferences.compact} onChange={(value) => setPreferences({ ...preferences, compact: value })} /></div>
        </Card>
        <Card>
          <CardHeader title="Notifications" description="These are in-app demo notifications only." />
          {[["payment", "Payment reminders", "Upcoming synthetic bills and status updates."], ["assessment", "Assessment updates", "When a new illustrative assessment is ready."], ["consent", "Consent changes", "Sharing and processing consent events."], ["reports", "Report availability", "When a synthetic report is generated."]].map(([key, title, description]) => <div className="fc-setting-row" key={key}><div><strong>{title}</strong><p>{description}</p></div><Toggle label={title} checked={preferences[key as keyof typeof preferences]} onChange={(value) => setPreferences({ ...preferences, [key]: value })} /></div>)}
        </Card>
        <Card>
          <CardHeader title="Locale" description="Display preferences for synthetic values." />
          <label className="fc-field"><span>Currency</span><select value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="INR">INR — Indian rupee</option><option value="USD">USD — US dollar (demo label)</option></select></label>
          <label className="fc-field"><span>Date format</span><select defaultValue="ddmmm"><option value="ddmmm">05 Nov 2026</option><option value="iso">2026-11-05</option><option value="dmy">05/11/2026</option></select></label>
          <InfoNote tone="blue">Amounts are design fixtures. Changing the currency label does not convert values.</InfoNote>
        </Card>
        <Card>
          <CardHeader title="Synthetic data" description="Restore the original design fixtures." />
          <p className="fc-card-description">Reset removes local payment edits, notification reads, profile changes, and consent changes for this browser.</p>
          <ActionButton variant="danger" icon={<RefreshCcw size={16} />} onClick={() => setResetOpen(true)}>Reset synthetic demo data</ActionButton>
        </Card>
      </div>
      <ConfirmDialog open={resetOpen} onClose={() => setResetOpen(false)} onConfirm={() => { resetDemoData(); setResetOpen(false); showToast({ title: "Demo data reset", message: "The original synthetic fixtures have been restored.", tone: "success" }); }} title="Reset all demo data?" description="Local edits and preferences will be replaced by the original fixtures. This cannot be undone." confirmLabel="Reset demo data" />
    </div>
  );
}

const HELP_TOPICS = [
  { q: "How is payment status derived?", a: "A payment is paid on time when its recorded payment date is on or before the due date. A later recorded settlement is paid late. Without a settlement, a due record is pending; a future record is upcoming. Missing records are never automatically missed." },
  { q: "Why does the score show coverage?", a: "Coverage explains how much evidence supports the assessment. A high score built on two months of records is very different from one built on twelve months across four categories." },
  { q: "How do I change my score?", a: "In the demo, add or edit synthetic records. You cannot improve the score by changing unrelated profile fields. The assessment is based on recorded payment patterns." },
  { q: "How do I stop lender sharing?", a: "Open Consent & Privacy and withdraw the lender-sharing purpose. New sharing under that purpose is blocked immediately in the demo." },
  { q: "Why are some records pending?", a: "A pending or upcoming bill has no recorded settlement. That is unknown rather than missed, so it is not counted as a late payment." },
  { q: "Can I use this with real data?", a: "No. This is a synthetic prototype. Do not enter real personal, identity, or financial information." },
];

export function ConsumerHelpPage() {
  const [search, setSearch] = useState("");
  const [issueOpen, setIssueOpen] = useState(false);
  const [issue, setIssue] = useState("");
  const [reference, setReference] = useState<string | null>(null);
  const topics = HELP_TOPICS.filter((topic) => `${topic.q} ${topic.a}`.toLowerCase().includes(search.toLowerCase()));

  function submitIssue(event: FormEvent) {
    event.preventDefault();
    if (!issue.trim()) return;
    const ref = `HLP-${Math.floor(1000 + Math.random() * 9000)}`;
    try {
      const existing = JSON.parse(window.localStorage.getItem("finance-credibility-support") ?? "[]") as unknown[];
      window.localStorage.setItem("finance-credibility-support", JSON.stringify([...existing, { reference: ref, type: "Help request", message: issue, createdAt: new Date().toISOString() }]));
    } catch {
      // Local-only support request.
    }
    setReference(ref);
    setIssue("");
  }

  return (
    <div className="fc-page">
      <PageHeader eyebrow="Help & support" title="How can we help?" description="Find answers about the synthetic demo or store a fictional support request." actions={<ButtonLink href="/contact" variant="secondary"><Mail size={16} /> Contact demo team</ButtonLink>} />
      <div className="fc-help-hero">
        <span className="fc-help-icon"><HelpCircle size={26} /></span>
        <div><h2>Search the demo help centre</h2><p>Payment status, score coverage, consent, reports, and data boundaries.</p><div className="fc-help-search"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search help topics" aria-label="Search help topics" /></div></div>
      </div>
      <div className="fc-dashboard-grid">
        <Card className="fc-span-2">
          <CardHeader title={search ? `Results for “${search}”` : "Common questions"} description={`${topics.length} topic${topics.length === 1 ? "" : "s"}`} />
          {topics.length === 0 ? <EmptyState icon={<Search size={22} />} title="No matching help topics" description="Try a shorter search or store a support request." action={<ActionButton variant="secondary" onClick={() => setSearch("")}>Clear search</ActionButton>} /> : <div className="fc-faq-list">{topics.map((topic) => <details key={topic.q} className="fc-faq-item" open={search ? true : undefined}><summary>{topic.q}<span>+</span></summary><p>{topic.a}</p></details>)}</div>}
        </Card>
        <div className="fc-stack">
          <Card><CardHeader title="Store a support request" description="Local demo only. No email is sent." /><p className="fc-card-description">Describe a demo question or design issue. A fictional reference is stored in this browser.</p><ActionButton variant="primary" icon={<Send size={16} />} onClick={() => { setIssueOpen(true); setReference(null); }}>Open request form</ActionButton></Card>
          <Card><CardHeader title="Demo resources" /><div className="fc-action-list"><Link href="/reports" className="fc-action-row"><span><FileText size={16} /></span><div><strong>Reports</strong><p>Synthetic exports</p></div><ChevronRight size={16} /></Link><Link href="/consent" className="fc-action-row"><span><ShieldCheck size={16} /></span><div><strong>Consent & privacy</strong><p>Review sharing</p></div><ChevronRight size={16} /></Link><Link href="/score" className="fc-action-row"><span><Gauge size={16} /></span><div><strong>Score explanation</strong><p>Indicators and coverage</p></div><ChevronRight size={16} /></Link></div></Card>
        </div>
      </div>
      <Modal open={issueOpen} onClose={() => setIssueOpen(false)} title="Store a demo support request" description="This creates a local reference only. Nothing is transmitted." footer={reference ? <ActionButton variant="primary" onClick={() => setIssueOpen(false)}>Done</ActionButton> : <><ActionButton variant="secondary" onClick={() => setIssueOpen(false)}>Cancel</ActionButton><ActionButton variant="primary" icon={<Send size={15} />} onClick={submitIssue}>Store request</ActionButton></>}>
        {reference ? <div className="fc-success-state"><span className="fc-success-icon"><CheckCircle2 size={24} /></span><h3>Request stored</h3><p>Your fictional reference is <code>{reference}</code>. It exists only in this browser.</p></div> : <label className="fc-field"><span>What can we help with?</span><textarea rows={5} value={issue} onChange={(event) => setIssue(event.target.value)} placeholder="Describe a demo question or issue..." /></label>}
      </Modal>
    </div>
  );
}
