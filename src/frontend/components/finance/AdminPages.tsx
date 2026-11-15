"use client";

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Database,
  Download,
  Eye,
  FileBarChart,
  FileText,
  Filter,
  Fingerprint,
  Gauge,
  History,
  KeyRound,
  Layers3,
  ListChecks,
  LockKeyhole,
  Pause,
  Play,
  Plus,
  Printer,
  RefreshCcw,
  Search,
  Server,
  Settings,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
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
  SearchInput,
  StatCard,
  StatusBadge,
} from "@/frontend/components/finance/ui";
import { PaymentActivityChart } from "@/frontend/components/finance/charts";
import {
  ADMIN_AUDIT_LOGS,
  ADMIN_CONSENTS,
  ADMIN_LENDERS,
  ADMIN_RECENT_PAYMENTS,
  ADMIN_REPORTS,
  ADMIN_USERS,
  DEMO_ANALYTICS,
  DEMO_INDICATORS,
  DEMO_MODEL,
  SYNTHETIC_BANNER,
  downloadTextFile,
  formatInr,
  reportCsvReport,
} from "@/frontend/lib/demo-data";
import { useToast } from "@/frontend/providers/ToastProvider";

function AdminMeta() {
  return (
    <>
      <Badge tone="violet" dot>Administrator</Badge>
      <span className="fc-meta-sep">·</span>
      <span>All data is synthetic</span>
    </>
  );
}

const BATCHES = [
  { id: "demo-202611", seed: "202611", consumers: 100, records: 7200, assessments: 1200, status: "Complete", generated: "11 Nov 2026 · 14:31" },
  { id: "demo-202610", seed: "202610", consumers: 100, records: 6900, assessments: 1140, status: "Complete", generated: "12 Oct 2026 · 10:08" },
  { id: "demo-202609", seed: "202609", consumers: 100, records: 6600, assessments: 1080, status: "Archived", generated: "11 Sep 2026 · 09:42" },
];

export function AdminDashboardPage() {
  const { showToast } = useToast();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lastRun, setLastRun] = useState("11 Nov 2026 · 14:31");
  const [seed, setSeed] = useState("202611");
  const [consumers, setConsumers] = useState("100");
  const [history, setHistory] = useState("12");
  const [scenario, setScenario] = useState("Mixed");

  function generate() {
    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
      setConfirmOpen(false);
      setLastRun("Just now · local demo");
      showToast({ title: "Synthetic batch generated", message: "The demo preview was recorded locally. No real data was created.", tone: "success" });
    }, 1000);
  }

  return (
    <div className="fc-page">
      <PageHeader
        eyebrow="Dashboard"
        title="Platform operations, visibly accountable."
        description="Administrative changes in this demo are local and synthetic. Production actions would require server-side role checks and immutable audit events."
        meta={<AdminMeta />}
        actions={<ButtonLink href="/admin/synthetic-data" variant="primary"><Sparkles size={16} /> Generate synthetic data</ButtonLink>}
      />
      <div className="fc-stat-grid">
        <StatCard label="Consumers" value="100" detail="Fictional identities only" icon={<Users size={20} />} tone="blue" href="/admin/users" />
        <StatCard label="Lender organizations" value="3" detail="Isolated demo tenants" icon={<Building2 size={20} />} tone="violet" href="/admin/lenders" />
        <StatCard label="Payment records" value="7,200" detail="Design fixture, not live count" icon={<Database size={20} />} tone="green" href="/admin/payments" />
        <StatCard label="Assessments" value="1,200" detail="Historical synthetic snapshots" icon={<Gauge size={20} />} tone="amber" href="/admin/scoring" />
      </div>
      <div className="fc-dashboard-grid">
        <Card className="fc-span-2">
          <CardHeader title="Synthetic dataset generation" description="Fixed seed, explicit scope, preview before confirmation." action={<Badge tone="green">Seed {seed}</Badge>} />
          <div className="fc-generation-grid">
            <label className="fc-field"><span>Seed</span><input value={seed} onChange={(event) => setSeed(event.target.value)} inputMode="numeric" /></label>
            <label className="fc-field"><span>Consumers</span><input value={consumers} onChange={(event) => setConsumers(event.target.value)} inputMode="numeric" /></label>
            <label className="fc-field"><span>History</span><select value={history} onChange={(event) => setHistory(event.target.value)}><option value="3">3 months</option><option value="6">6 months</option><option value="12">12 months</option></select></label>
            <label className="fc-field"><span>Scenario</span><select value={scenario} onChange={(event) => setScenario(event.target.value)}><option>Mixed</option><option>High punctuality</option><option>Thin coverage</option><option>Improving trend</option></select></label>
          </div>
          <div className="fc-generation-summary"><div><span>Target records</span><strong>{Number(consumers) * Number(history) * 6}</strong></div><div><span>Last generation</span><strong>{lastRun}</strong></div><div><span>Status</span><Badge tone="green" dot>Ready to preview</Badge></div></div>
          <div className="fc-inline-actions"><ActionButton variant="secondary" onClick={() => setPreviewOpen(true)} icon={<Eye size={15} />}>Preview generation</ActionButton><ActionButton variant="primary" onClick={() => setConfirmOpen(true)} icon={<Sparkles size={15} />}>Generate batch</ActionButton></div>
        </Card>
        <Card>
          <CardHeader title="Scoring model governance" description="FC-DEMO-1.0 · experimental" action={<Badge tone="amber">Versioned</Badge>} />
          <div className="fc-model-summary"><div className="fc-model-version">1.0</div><div><strong>FC-DEMO-1.0</strong><p>Weights and formula are versioned. A new version never silently rewrites historical assessments.</p></div></div>
          <div className="fc-model-stats"><div><span>Indicators</span><strong>10</strong></div><div><span>Historical snapshots</span><strong>1,200</strong></div><div><span>Recalculation</span><strong>Logged</strong></div></div>
          <Link href="/admin/scoring" className="fc-text-link">Open scoring engine <ArrowRight size={14} /></Link>
        </Card>
      </div>
      <div className="fc-dashboard-grid">
        <Card className="fc-span-2">
          <CardHeader title="Recent audit events" description="Every sensitive action creates an immutable event in the production design." action={<Link href="/admin/audit-logs" className="fc-text-link">View all <ArrowRight size={14} /></Link>} />
          <div className="fc-table-wrap"><table className="fc-table"><thead><tr><th>Time (UTC)</th><th>Actor</th><th>Action</th><th>Scope</th><th>Request ID</th></tr></thead><tbody>{ADMIN_AUDIT_LOGS.slice(0, 6).map((event) => <tr key={event.id}><td className="mono">{event.time}</td><td>{event.actor}</td><td><code>{event.action}</code></td><td>{event.scope}</td><td className="mono fc-table-sub">{event.requestId}</td></tr>)}</tbody></table></div>
        </Card>
        <Card>
          <CardHeader title="Record volume" description="Synthetic payment records by month." />
          <PaymentActivityChart data={DEMO_ANALYTICS} height={228} />
        </Card>
      </div>
      <InfoNote tone="blue" title="Environment boundary">
        This is a local synthetic prototype. Onboarding, email delivery, OTP, real identities, and
        production persistence are not connected.
      </InfoNote>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Generation preview" description="Preview only. Nothing is written until you confirm." size="lg" footer={<><ActionButton variant="secondary" onClick={() => setPreviewOpen(false)}>Cancel</ActionButton><ActionButton variant="primary" onClick={() => { setPreviewOpen(false); setConfirmOpen(true); }}>Continue to confirmation</ActionButton></>}>
        <div className="fc-report-preview-grid"><div><span>Batch</span><strong>demo-{seed}</strong></div><div><span>Seed</span><strong>{seed}</strong></div><div><span>Consumers</span><strong>{consumers}</strong></div><div><span>History</span><strong>{history} months</strong></div><div><span>Scenario</span><strong>{scenario}</strong></div><div><span>Target records</span><strong>{Number(consumers) * Number(history) * 6}</strong></div></div>
        <div className="fc-generation-sample"><h3>Sample identities</h3>{ADMIN_USERS.slice(0, 5).map((user) => <div key={user.id}><span>{user.name}</span><code>{user.email}</code><Badge tone="neutral">Fictional</Badge></div>)}</div>
        <InfoNote tone="amber">{SYNTHETIC_BANNER}</InfoNote>
      </Modal>
      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={generate} title="Generate synthetic batch?" description="This creates frozen demo fixtures. It does not create real users, records, or assessments." confirmLabel="Confirm generation" tone="primary" busy={generating}>
        <div className="fc-confirm-target"><strong>Seed {seed} · {consumers} consumers · {history} months</strong><span>{scenario} scenario · preview reviewed</span></div>
      </ConfirmDialog>
    </div>
  );
}

export function AdminUsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState(ADMIN_USERS);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<(typeof ADMIN_USERS)[number] | null>(null);
  const [actionUser, setActionUser] = useState<(typeof ADMIN_USERS)[number] | null>(null);
  const pageSize = 12;

  const filtered = useMemo(() => users.filter((user) => (role === "all" || user.role === role) && (status === "all" || user.status === status) && (!search || `${user.name} ${user.email} ${user.location}`.toLowerCase().includes(search.toLowerCase()))), [users, role, status, search]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize);

  function toggleUser() {
    if (!actionUser) return;
    const nextStatus = actionUser.status === "Active" ? "Disabled" : "Active";
    setUsers((currentUsers) => currentUsers.map((user) => user.id === actionUser.id ? { ...user, status: nextStatus } : user));
    showToast({ title: nextStatus === "Active" ? "Account enabled" : "Account disabled", message: nextStatus === "Disabled" ? "Demo sessions would be revoked in the production design." : "The synthetic account can access its workspace again.", tone: "success" });
    setActionUser(null);
    setSelected(null);
  }

  function exportUsers() {
    downloadTextFile("finance-credibility-demo-users.csv", ["Name,Email,Role,Status,Location,Joined,Last active", ...filtered.map((u) => `"${u.name}","${u.email}","${u.role}","${u.status}","${u.location}","${u.joined}","${u.lastActive}"`)].join("\n"));
    showToast({ title: "User list exported", message: "Synthetic CSV downloaded.", tone: "success" });
  }

  return (
    <div className="fc-page">
      <PageHeader eyebrow="Users" title="Demo identities and access states." description="Fictional consumers, lenders, and administrators. Disabling an account would revoke sessions in a production design." meta={<AdminMeta />} actions={<ActionButton variant="secondary" icon={<Download size={15} />} onClick={exportUsers}>Export users</ActionButton>} />
      <div className="fc-stat-grid"><StatCard label="Total users" value="100" detail="Fictional identities only" icon={<Users size={20} />} tone="blue" /><StatCard label="Consumers" value="97" detail="Synthetic consumer accounts" icon={<UserRound size={20} />} tone="green" /><StatCard label="Lender users" value="2" detail="One active demo organization lead" icon={<Building2 size={20} />} tone="violet" /><StatCard label="Disabled" value="1" detail="Sessions revoked in production" icon={<LockKeyhole size={20} />} tone="amber" /></div>
      <Card>
        <div className="fc-toolbar"><SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search users" /><div className="fc-toolbar-filters"><label className="fc-filter"><span>Role</span><select value={role} onChange={(event) => { setRole(event.target.value); setPage(1); }}><option value="all">All</option><option>Consumer</option><option>Lender</option><option>Administrator</option></select></label><label className="fc-filter"><span>Status</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">All</option><option>Active</option><option>Disabled</option></select></label></div></div>
        {rows.length === 0 ? <EmptyState icon={<Search size={22} />} title="No users match" description="Adjust the search or filters." /> : <><div className="fc-table-wrap"><table className="fc-table"><thead><tr><th>User</th><th>Role</th><th>Location</th><th>Joined</th><th>Last active</th><th>Status</th><th><span className="sr-only">View</span></th></tr></thead><tbody>{rows.map((user) => <tr key={user.id}><td><button type="button" className="fc-table-title fc-button-link" onClick={() => setSelected(user)}>{user.name}</button><span className="fc-table-sub">{user.email}</span></td><td><Badge tone={user.role === "Administrator" ? "violet" : user.role === "Lender" ? "blue" : "neutral"}>{user.role}</Badge></td><td>{user.location}</td><td>{user.joined}</td><td>{user.lastActive}</td><td><StatusBadge status={user.status} /></td><td><button type="button" className="fc-icon-btn" onClick={() => setSelected(user)} aria-label={`View ${user.name}`}><Eye size={15} /></button></td></tr>)}</tbody></table></div><div className="fc-pagination"><span>Showing {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, filtered.length)} of {filtered.length}</span><div><button type="button" className="fc-icon-btn" onClick={() => setPage(Math.max(1, current - 1))} disabled={current === 1} aria-label="Previous page"><ChevronLeft size={16} /></button><span>Page {current} of {totalPages}</span><button type="button" className="fc-icon-btn" onClick={() => setPage(Math.min(totalPages, current + 1))} disabled={current === totalPages} aria-label="Next page"><ChevronRight size={16} /></button></div></div></>}
      </Card>
      <InfoNote tone="blue">Role checks are enforced server-side in production. A frontend claim never grants administrative access.</InfoNote>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name ?? "Demo user"} description="Synthetic user detail" size="md" footer={selected ? <><ActionButton variant="secondary" onClick={() => setSelected(null)}>Close</ActionButton><ActionButton variant={selected.status === "Active" ? "danger" : "primary"} onClick={() => setActionUser(selected)}>{selected.status === "Active" ? "Disable account" : "Enable account"}</ActionButton></> : null}>
        {selected ? <><div className="fc-user-detail-head"><span className="fc-profile-avatar">{selected.name.split(" ").map((part) => part[0]).join("")}</span><div><h3>{selected.name}</h3><p>{selected.email}</p><div className="fc-inline-badges"><Badge tone={selected.role === "Administrator" ? "violet" : "blue"}>{selected.role}</Badge><StatusBadge status={selected.status} /></div></div></div><dl className="fc-detail-list"><div><dt>User ID</dt><dd className="mono">{selected.id}</dd></div><div><dt>Location</dt><dd>{selected.location}</dd></div><div><dt>Joined</dt><dd>{selected.joined}</dd></div><div><dt>Last active</dt><dd>{selected.lastActive}</dd></div><div><dt>Demo tenant</dt><dd>Finance Credibility</dd></div><div><dt>Session state</dt><dd>{selected.status === "Active" ? "Session allowed" : "Sessions revoked"}</dd></div></dl><InfoNote tone="amber">This is a fictional account. No email or identity verification is connected.</InfoNote></> : null}
      </Modal>
      <ConfirmDialog open={Boolean(actionUser)} onClose={() => setActionUser(null)} onConfirm={toggleUser} title={actionUser?.status === "Active" ? "Disable this demo account?" : "Enable this demo account?"} description={actionUser?.status === "Active" ? "The account would be blocked and active sessions revoked in the production design." : "The synthetic account will be able to sign in to the demo again."} confirmLabel={actionUser?.status === "Active" ? "Disable account" : "Enable account"} tone={actionUser?.status === "Active" ? "danger" : "primary"}>
        {actionUser ? <div className="fc-confirm-target"><strong>{actionUser.name}</strong><span>{actionUser.email}</span></div> : null}
      </ConfirmDialog>
    </div>
  );
}

export function AdminLendersPage() {
  const { showToast } = useToast();
  const [lenders, setLenders] = useState(ADMIN_LENDERS);
  const [selected, setSelected] = useState<(typeof ADMIN_LENDERS)[number] | null>(null);
  const [action, setAction] = useState<(typeof ADMIN_LENDERS)[number] | null>(null);

  function toggleLender() {
    if (!action) return;
    const next = action.status === "Active" ? "Paused" : "Active";
    setLenders((current) => current.map((lender) => lender.id === action.id ? { ...lender, status: next } : lender));
    showToast({ title: next === "Paused" ? "Lender organization paused" : "Lender organization enabled", message: "The change is local to this synthetic console.", tone: "success" });
    setAction(null);
    setSelected(null);
  }

  return (
    <div className="fc-page">
      <PageHeader eyebrow="Lender organizations" title="Isolated demo tenants." description="Each organization has a distinct applicant scope. There is no cross-tenant applicant list." meta={<AdminMeta />} actions={<Badge tone="amber">3 synthetic tenants</Badge>} />
      <div className="fc-stat-grid"><StatCard label="Lender organizations" value="3" detail="Isolated demo tenants" icon={<Building2 size={20} />} tone="violet" /><StatCard label="Active organizations" value="2" detail="One paused demo tenant" icon={<CheckCircle2 size={20} />} tone="green" /><StatCard label="Authorized applicants" value="78" detail="Across all demo tenants" icon={<Users size={20} />} tone="blue" /><StatCard label="Organization users" value="9" detail="Fictional lender identities" icon={<UserRound size={20} />} tone="amber" /></div>
      <div className="fc-lender-org-grid">
        {lenders.map((lender) => (
          <Card key={lender.id} className="fc-lender-org-card">
            <div className="fc-lender-org-top"><span className="fc-lender-org-icon"><Building2 size={22} /></span><StatusBadge status={lender.status} /></div>
            <h3>{lender.name}</h3><p>{lender.code} · Created {lender.created}</p>
            <div className="fc-lender-org-stats"><div><span>Applicants</span><strong>{lender.applicants}</strong></div><div><span>Members</span><strong>{lender.members}</strong></div></div>
            <div className="fc-lender-org-contact"><span>Primary contact</span><strong>{lender.contact}</strong><small>{lender.email}</small></div>
            <div className="fc-report-actions"><ActionButton variant="secondary" size="sm" onClick={() => setSelected(lender)}>View organization</ActionButton><ActionButton variant={lender.status === "Active" ? "ghost" : "secondary"} size="sm" onClick={() => setAction(lender)}>{lender.status === "Active" ? "Pause" : "Enable"}</ActionButton></div>
          </Card>
        ))}
      </div>
      <InfoNote tone="blue" title="Tenant isolation is a backend responsibility">
        Lists, details, aggregates, reports, and exports each require active organization scope. A
        frontend organization label is never trusted.
      </InfoNote>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name ?? "Organization"} description="Synthetic lender tenant detail" footer={selected ? <><ActionButton variant="secondary" onClick={() => setSelected(null)}>Close</ActionButton><ActionButton variant="secondary" icon={<FileText size={15} />} onClick={() => { downloadTextFile(`finance-credibility-${selected.code}.csv`, reportCsvReport(`Lender organization — ${selected.name}`)); showToast({ title: "Demo organization report downloaded", tone: "success" }); }}>Export summary</ActionButton></> : null}>
        {selected ? <><div className="fc-report-preview-grid"><div><span>Code</span><strong>{selected.code}</strong></div><div><span>Status</span><strong>{selected.status}</strong></div><div><span>Contact</span><strong>{selected.contact}</strong></div><div><span>Email</span><strong>{selected.email}</strong></div><div><span>Members</span><strong>{selected.members}</strong></div><div><span>Applicants</span><strong>{selected.applicants}</strong></div></div><div className="fc-policy-list">{["Organization-scoped applicant access", "No cross-tenant aggregates", "Consent required for every applicant", "Report exports audited"].map((item) => <div key={item}><CheckCircle2 size={15} /><span>{item}</span></div>)}</div></> : null}
      </Modal>
      <ConfirmDialog open={Boolean(action)} onClose={() => setAction(null)} onConfirm={toggleLender} title={action?.status === "Active" ? "Pause this lender organization?" : "Enable this lender organization?"} description="This changes access for the synthetic tenant only. No real organization is affected." confirmLabel={action?.status === "Active" ? "Pause organization" : "Enable organization"} tone={action?.status === "Active" ? "danger" : "primary"} />
    </div>
  );
}

export function AdminPaymentsPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<(typeof ADMIN_RECENT_PAYMENTS)[number] | null>(null);

  const filtered = ADMIN_RECENT_PAYMENTS.filter((payment) => (category === "all" || payment.category === category) && (status === "all" || payment.status === status) && (!search || `${payment.consumer} ${payment.title} ${payment.id}`.toLowerCase().includes(search.toLowerCase())));

  function exportPayments() {
    downloadTextFile("finance-credibility-demo-payments.csv", ["ID,Consumer,Title,Category,Amount,Due date,Status", ...filtered.map((p) => `"${p.id}","${p.consumer}","${p.title}","${p.category}","${p.amount}","${p.dueDate}","${p.status}"`)].join("\n"));
    showToast({ title: "Payment records exported", message: "Synthetic CSV downloaded.", tone: "success" });
  }

  return (
    <div className="fc-page">
      <PageHeader eyebrow="Payment records" title="Synthetic payment inventory." description="A fixture view of recorded payments across demo consumers. Amounts are fictional and no real transactions exist." meta={<AdminMeta />} actions={<ActionButton variant="secondary" icon={<Download size={15} />} onClick={exportPayments}>Export records</ActionButton>} />
      <div className="fc-stat-grid"><StatCard label="Total records" value="7,200" detail="Design fixture, not live count" icon={<Database size={20} />} tone="blue" /><StatCard label="Settled on time" value="94%" detail="Illustrative synthetic rate" icon={<CheckCircle2 size={20} />} tone="green" /><StatCard label="Late records" value="190" detail="Of 7,200 synthetic records" icon={<AlertTriangle size={20} />} tone="amber" /><StatCard label="Upcoming / pending" value="240" detail="Unknown, not treated as missed" icon={<Clock3 size={20} />} tone="violet" /></div>
      <Card>
        <div className="fc-toolbar"><SearchInput value={search} onChange={setSearch} placeholder="Search records" /><div className="fc-toolbar-filters"><label className="fc-filter"><span>Category</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="all">All</option><option>Rent</option><option>Utilities</option><option>Internet</option><option>Insurance</option><option>Education</option><option>Subscriptions</option></select></label><label className="fc-filter"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All</option><option>Paid on time</option><option>Paid late</option><option>Pending</option><option>Upcoming</option></select></label></div></div>
        <div className="fc-table-wrap"><table className="fc-table"><thead><tr><th>Record</th><th>Consumer</th><th>Category</th><th>Amount</th><th>Due date</th><th>Status</th><th><span className="sr-only">View</span></th></tr></thead><tbody>{filtered.map((payment) => <tr key={payment.id}><td><button type="button" className="fc-table-title fc-button-link" onClick={() => setSelected(payment)}>{payment.title}</button><span className="fc-table-sub mono">{payment.id}</span></td><td>{payment.consumer}</td><td>{payment.category}</td><td className="fc-amount">{formatInr(payment.amount)}</td><td>{payment.dueDate}</td><td><StatusBadge status={payment.status} /></td><td><button type="button" className="fc-icon-btn" onClick={() => setSelected(payment)} aria-label={`View ${payment.title}`}><Eye size={15} /></button></td></tr>)}</tbody></table></div>
      </Card>
      <InfoNote tone="blue">Showing the latest 20 fixture records. The 7,200 total is a design count, not a live database count.</InfoNote>
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? "Payment record"} description="Synthetic payment detail" footer={<ActionButton variant="secondary" onClick={() => setSelected(null)}>Close</ActionButton>}>
        {selected ? <><div className="fc-report-preview-grid"><div><span>Record ID</span><strong className="mono">{selected.id}</strong></div><div><span>Consumer</span><strong>{selected.consumer}</strong></div><div><span>Category</span><strong>{selected.category}</strong></div><div><span>Amount</span><strong>{formatInr(selected.amount)}</strong></div><div><span>Due date</span><strong>{selected.dueDate}</strong></div><div><span>Derived status</span><strong>{selected.status}</strong></div></div><InfoNote tone="amber">This record is fictional and not linked to a real consumer or payment provider.</InfoNote></> : null}
      </Modal>
    </div>
  );
}

export function AdminScoringPage() {
  const { showToast } = useToast();
  const [versions, setVersions] = useState([
    { version: "1.0", model: "FC-DEMO-1.0", status: "Active", created: "01 Nov 2026", author: "Demo Admin", note: "Initial experimental specification." },
    { version: "0.9", model: "FC-DEMO-0.9", status: "Retired", created: "12 Oct 2026", author: "Demo Admin", note: "Pre-release indicator weights." },
  ]);
  const [draftOpen, setDraftOpen] = useState(false);
  const [note, setNote] = useState("");
  const [version, setVersion] = useState("1.1");
  const [confirmed, setConfirmed] = useState(false);

  function createDraft(event: FormEvent) {
    event.preventDefault();
    if (!note.trim() || !confirmed) return;
    setVersions((current) => [{ version, model: `FC-DEMO-${version}`, status: "Draft", created: "Just now", author: "Demo Admin", note: note.trim() }, ...current]);
    setDraftOpen(false);
    setNote("");
    setConfirmed(false);
    showToast({ title: "Scoring draft created", message: "Historical assessments remain unchanged. Activation would be a separate logged operation.", tone: "success" });
  }

  return (
    <div className="fc-page">
      <PageHeader eyebrow="Scoring engine" title="Versioned, explainable model governance." description="Weights and formula are versioned. A new version never silently rewrites historical assessments." meta={<AdminMeta />} actions={<ActionButton variant="primary" icon={<Plus size={15} />} onClick={() => setDraftOpen(true)}>New draft version</ActionButton>} />
      <div className="fc-dashboard-grid">
        <Card className="fc-span-2">
          <CardHeader title="FC-DEMO-1.0 indicator contract" description="Illustrative weights; not empirically validated." action={<Badge tone="green" dot>Active</Badge>} />
          <div className="fc-table-wrap"><table className="fc-table"><thead><tr><th>Indicator</th><th>Weight</th><th>Value in sample</th><th>Definition</th></tr></thead><tbody>{DEMO_INDICATORS.map((indicator) => <tr key={indicator.name}><td>{indicator.name}</td><td><code>{indicator.weight}</code></td><td>{indicator.value}/100</td><td className="fc-table-definition">{indicator.name === "Payment consistency" ? "1 − population SD of monthly paid fractions." : indicator.name === "Payment punctuality" ? "On-time settled records / all settled records." : indicator.name === "Data coverage" ? "Months, records, and category components." : "Normalized observed payment indicator."}</td></tr>)}</tbody></table></div>
        </Card>
        <div className="fc-stack">
          <Card><CardHeader title="Aggregation" /><code className="fc-formula fc-formula-sm">300 + floor(600 × B + 0.5)</code><p className="fc-card-description">B is the weighted average of available normalized indicators. Missing indicators are excluded, never assigned zero.</p><InfoNote tone="amber">Fewer than 6 records or 3 observed billing months produces insufficient_data, not a score.</InfoNote></Card>
          <Card><CardHeader title="Immutability" /><div className="fc-policy-list">{["Version stored with every assessment", "Input hash and as-of date persisted", "Recalculation is a logged operation", "Estimates never rewritten silently"].map((item) => <div key={item}><Fingerprint size={15} /><span>{item}</span></div>)}</div></Card>
        </div>
      </div>
      <Card>
        <CardHeader title="Version history" description="Draft versions are isolated until activation." />
        <div className="fc-table-wrap"><table className="fc-table"><thead><tr><th>Version</th><th>Model</th><th>Status</th><th>Created</th><th>Author</th><th>Change note</th></tr></thead><tbody>{versions.map((item) => <tr key={item.version}><td><code>{item.version}</code></td><td>{item.model}</td><td><StatusBadge status={item.status} /></td><td>{item.created}</td><td>{item.author}</td><td className="fc-table-definition">{item.note}</td></tr>)}</tbody></table></div>
      </Card>
      <InfoNote tone="blue" title="Historical assessments are immutable">
        Activating a new model affects future assessments only. Existing synthetic snapshots retain
        their version, weights, input hash, and reason codes.
      </InfoNote>

      <Modal open={draftOpen} onClose={() => setDraftOpen(false)} title="Create scoring draft" description="A draft does not affect active assessments." footer={<><ActionButton variant="secondary" onClick={() => setDraftOpen(false)}>Cancel</ActionButton><ActionButton variant="primary" onClick={() => { if (note.trim() && confirmed) { setVersions((current) => [{ version, model: `FC-DEMO-${version}`, status: "Draft", created: "Just now", author: "Demo Admin", note: note.trim() }, ...current]); setDraftOpen(false); setNote(""); setConfirmed(false); showToast({ title: "Scoring draft created", message: "Historical assessments remain unchanged.", tone: "success" }); } }}>Create draft</ActionButton></>}>
        <div className="fc-form"><label className="fc-field"><span>Version</span><input value={version} onChange={(event) => setVersion(event.target.value)} placeholder="1.1" /></label><label className="fc-field"><span>Change note</span><textarea rows={3} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Describe the proposed weight or formula change..." /></label><label className="fc-check"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>I understand drafts do not rewrite historical assessments.</span></label></div>
      </Modal>
    </div>
  );
}

export function AdminSyntheticDataPage() {
  const { showToast } = useToast();
  const [seed, setSeed] = useState("202611");
  const [consumers, setConsumers] = useState("100");
  const [history, setHistory] = useState("12");
  const [scenario, setScenario] = useState("Mixed");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [batches, setBatches] = useState(BATCHES);

  function generate() {
    if (!confirmed) return;
    setGenerating(true);
    window.setTimeout(() => {
      setGenerating(false);
      setConfirmOpen(false);
      setConfirmed(false);
      setBatches((current) => [{ id: `demo-${seed}`, seed, consumers: Number(consumers), records: Number(consumers) * Number(history) * 6, assessments: Number(consumers) * 12, status: "Complete", generated: "Just now · local demo" }, ...current]);
      showToast({ title: "Synthetic batch generated", message: "A local demo batch was recorded. No real data was created.", tone: "success" });
    }, 1100);
  }

  return (
    <div className="fc-page">
      <PageHeader eyebrow="Synthetic data" title="Deterministic demo generation." description="A fixed seed produces a previewable, reproducible batch of fictional consumers, records, and assessments." meta={<AdminMeta />} actions={<Badge tone="amber" dot>No real data</Badge>} />
      <div className="fc-dashboard-grid">
        <Card className="fc-span-2">
          <CardHeader title="Generation parameters" description="Preview is required before confirmation." />
          <div className="fc-generation-grid"><label className="fc-field"><span>Fixed seed</span><input value={seed} onChange={(event) => setSeed(event.target.value)} inputMode="numeric" /></label><label className="fc-field"><span>Consumers</span><input value={consumers} onChange={(event) => setConsumers(event.target.value)} inputMode="numeric" /></label><label className="fc-field"><span>History</span><select value={history} onChange={(event) => setHistory(event.target.value)}><option value="1">1 month</option><option value="3">3 months</option><option value="6">6 months</option><option value="12">12 months</option></select></label><label className="fc-field"><span>Scenario</span><select value={scenario} onChange={(event) => setScenario(event.target.value)}><option>Mixed</option><option>High punctuality</option><option>Thin coverage</option><option>Improving trend</option><option>Insufficient data</option></select></label></div>
          <div className="fc-generation-summary"><div><span>Target records</span><strong>{Number(consumers) * Number(history) * 6}</strong></div><div><span>Target assessments</span><strong>{Number(consumers) * 12}</strong></div><div><span>Seed behavior</span><strong>Deterministic</strong></div><div><span>Preview</span><Badge tone="green" dot>Ready</Badge></div></div>
          <div className="fc-inline-actions"><ActionButton variant="secondary" onClick={() => setPreviewOpen(true)} icon={<Eye size={15} />}>Preview generation</ActionButton><ActionButton variant="primary" onClick={() => setConfirmOpen(true)} icon={<Sparkles size={15} />}>Generate batch</ActionButton></div>
        </Card>
        <Card><CardHeader title="Safety boundary" /><div className="fc-policy-list">{["Fictional identities only", "No external verification", "No payment provider connection", "Deterministic for repeatable demos", "Synthetic disclaimer on every surface"].map((item) => <div key={item}><ShieldCheck size={15} /><span>{item}</span></div>)}</div><InfoNote tone="amber">Production startup would reject demo credentials and absent signing secrets.</InfoNote></Card>
      </div>
      <Card>
        <CardHeader title="Recent batches" description="Local fixture history for the demo console." />
        <div className="fc-table-wrap"><table className="fc-table"><thead><tr><th>Batch</th><th>Seed</th><th>Consumers</th><th>Records</th><th>Assessments</th><th>Generated</th><th>Status</th></tr></thead><tbody>{batches.map((batch) => <tr key={`${batch.id}-${batch.generated}`}><td><code>{batch.id}</code></td><td>{batch.seed}</td><td>{batch.consumers}</td><td>{batch.records.toLocaleString("en-IN")}</td><td>{batch.assessments.toLocaleString("en-IN")}</td><td>{batch.generated}</td><td><StatusBadge status={batch.status} /></td></tr>)}</tbody></table></div>
      </Card>

      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)} title="Generation preview" description="Review the batch scope before confirmation." size="lg" footer={<><ActionButton variant="secondary" onClick={() => setPreviewOpen(false)}>Cancel</ActionButton><ActionButton variant="primary" onClick={() => { setPreviewOpen(false); setConfirmOpen(true); }}>Continue to confirmation</ActionButton></>}>
        <div className="fc-report-preview-grid"><div><span>Batch</span><strong>demo-{seed}</strong></div><div><span>Seed</span><strong>{seed}</strong></div><div><span>Consumers</span><strong>{consumers}</strong></div><div><span>History</span><strong>{history} months</strong></div><div><span>Scenario</span><strong>{scenario}</strong></div><div><span>Target records</span><strong>{Number(consumers) * Number(history) * 6}</strong></div></div>
        <div className="fc-generation-sample"><h3>Sample identities</h3>{ADMIN_USERS.slice(0, 5).map((user) => <div key={user.id}><span>{user.name}</span><code>{user.email}</code><Badge tone="neutral">Fictional</Badge></div>)}</div>
        <p className="fc-report-footnote">{SYNTHETIC_BANNER}</p>
      </Modal>
      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Confirm synthetic generation" description="This creates local demo fixtures only." footer={<><ActionButton variant="secondary" onClick={() => setConfirmOpen(false)} disabled={generating}>Cancel</ActionButton><ActionButton variant="primary" onClick={generate} disabled={!confirmed || generating} icon={generating ? <RefreshCcw size={15} className="fc-spin" /> : <Sparkles size={15} />}>{generating ? "Generating…" : "Confirm generation"}</ActionButton></>}>
        <div className="fc-confirm-target"><strong>Seed {seed} · {consumers} consumers · {history} months</strong><span>{scenario} scenario · {Number(consumers) * Number(history) * 6} target records</span></div>
        <label className="fc-check fc-check-block"><input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} /><span>I understand this is a fictional batch and no real consumer data will be created.</span></label>
      </Modal>
    </div>
  );
}

export function AdminReportsPage() {
  const { showToast } = useToast();
  const [selected, setSelected] = useState<(typeof ADMIN_REPORTS)[number] | null>(null);

  function download(report: (typeof ADMIN_REPORTS)[number]) {
    downloadTextFile(`finance-credibility-admin-${report.id}.csv`, reportCsvReport(report.name));
    showToast({ title: "Synthetic report downloaded", message: `${report.name} generated as CSV.`, tone: "success" });
  }

  return (
    <div className="fc-page">
      <PageHeader eyebrow="Reports" title="Operational reporting." description="Synthetic reports for platform usage, data inventory, model history, consent, and audit activity." meta={<AdminMeta />} actions={<Badge tone="amber" dot>Demo exports</Badge>} />
      <div className="fc-report-grid">{ADMIN_REPORTS.map((report) => <Card key={report.id} className="fc-report-card"><div className="fc-report-top"><span className="fc-report-icon"><FileBarChart size={21} /></span><Badge tone={report.format === "PDF" ? "violet" : "green"}>{report.format}</Badge></div><h3>{report.name}</h3><p>{report.scope}</p><div className="fc-report-meta"><span>{report.period}</span><span>Generated {report.generated}</span></div><div className="fc-report-actions"><ActionButton variant="secondary" size="sm" icon={<Printer size={14} />} onClick={() => setSelected(report)}>Preview</ActionButton><ActionButton variant="ghost" size="sm" icon={<Download size={14} />} onClick={() => download(report)}>CSV</ActionButton></div></Card>)}</div>
      <InfoNote tone="blue">Report generation rechecks administrative permissions. No real consumer or lender records are included.</InfoNote>
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name ?? "Report preview"} description="Synthetic administrative report preview." size="lg" footer={<><ActionButton variant="secondary" onClick={() => setSelected(null)}>Close</ActionButton><ActionButton variant="primary" icon={<Printer size={15} />} onClick={() => window.print()}>Print / Save PDF</ActionButton></>}>
        {selected ? <div className="fc-print-area"><div className="fc-report-preview-head"><div><p>Finance Credibility · Administration</p><h2>{selected.name}</h2></div><Badge tone="amber">SYNTHETIC</Badge></div><p className="fc-report-disclaimer">{SYNTHETIC_BANNER}</p><div className="fc-report-preview-grid"><div><span>Scope</span><strong>{selected.scope}</strong></div><div><span>Period</span><strong>{selected.period}</strong></div><div><span>Format</span><strong>{selected.format}</strong></div><div><span>Generated</span><strong>{selected.generated}</strong></div></div><table className="fc-table"><thead><tr><th>Metric</th><th>Value</th></tr></thead><tbody><tr><td>Consumers</td><td>100</td></tr><tr><td>Lender organizations</td><td>3</td></tr><tr><td>Payment records</td><td>7,200</td></tr><tr><td>Assessments</td><td>1,200</td></tr><tr><td>Audit events</td><td>12 shown in fixture</td></tr></tbody></table></div> : null}
      </Modal>
    </div>
  );
}

export function AdminConsentsPage() {
  const { showToast } = useToast();
  const [consents, setConsents] = useState(ADMIN_CONSENTS);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<(typeof ADMIN_CONSENTS)[number] | null>(null);
  const [withdraw, setWithdraw] = useState<(typeof ADMIN_CONSENTS)[number] | null>(null);

  const filtered = consents.filter((consent) => (status === "all" || consent.status === status) && (!search || `${consent.consumer} ${consent.organization} ${consent.purpose}`.toLowerCase().includes(search.toLowerCase())));

  function withdrawConsent() {
    if (!withdraw) return;
    setConsents((current) => current.map((consent) => consent.id === withdraw.id ? { ...consent, status: "Withdrawn", expires: "Withdrawn just now" } : consent));
    showToast({ title: "Consent withdrawn", message: "New sharing is blocked in the demo. Existing reports are unchanged.", tone: "success" });
    setWithdraw(null);
    setSelected(null);
  }

  return (
    <div className="fc-page">
      <PageHeader eyebrow="Consent records" title="Purpose-specific consent register." description="Processing and organization sharing are separate. Withdrawal blocks new sharing immediately." meta={<AdminMeta />} actions={<Badge tone="green">Synthetic register</Badge>} />
      <div className="fc-stat-grid"><StatCard label="Active consents" value="37" detail="Across demo applicants" icon={<ShieldCheck size={20} />} tone="green" /><StatCard label="Sharing consents" value="14" detail="Purpose-specific lender access" icon={<Building2 size={20} />} tone="blue" /><StatCard label="Expiring soon" value="4" detail="Within the next 30 days" icon={<Clock3 size={20} />} tone="amber" /><StatCard label="Withdrawn" value="2" detail="New sharing blocked" icon={<LockKeyhole size={20} />} tone="violet" /></div>
      <Card>
        <div className="fc-toolbar"><SearchInput value={search} onChange={setSearch} placeholder="Search consent records" /><div className="fc-toolbar-filters"><label className="fc-filter"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All</option><option value="Active">Active</option><option value="Withdrawn">Withdrawn</option></select></label></div></div>
        {filtered.length === 0 ? <EmptyState icon={<Search size={22} />} title="No consent records match" description="Adjust the search or status filter." /> : <div className="fc-table-wrap"><table className="fc-table"><thead><tr><th>Consumer</th><th>Purpose</th><th>Organization</th><th>Granted</th><th>Expires</th><th>Status</th><th><span className="sr-only">View</span></th></tr></thead><tbody>{filtered.map((consent) => <tr key={consent.id}><td><button type="button" className="fc-table-title fc-button-link" onClick={() => setSelected(consent)}>{consent.consumer}</button><span className="fc-table-sub mono">{consent.id}</span></td><td>{consent.purpose}</td><td>{consent.organization}</td><td>{consent.granted}</td><td>{consent.expires}</td><td><StatusBadge status={consent.status} /></td><td><button type="button" className="fc-icon-btn" onClick={() => setSelected(consent)} aria-label={`View ${consent.consumer} consent`}><Eye size={15} /></button></td></tr>)}</tbody></table></div>}
      </Card>

      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Consent record" description="Synthetic purpose-specific consent detail" footer={selected ? <><ActionButton variant="secondary" onClick={() => setSelected(null)}>Close</ActionButton>{selected.status === "Active" ? <ActionButton variant="danger" onClick={() => setWithdraw(selected)}>Withdraw consent</ActionButton> : null}</> : null}>
        {selected ? <><dl className="fc-detail-list"><div><dt>Consumer</dt><dd>{selected.consumer}</dd></div><div><dt>Purpose</dt><dd>{selected.purpose}</dd></div><div><dt>Organization</dt><dd>{selected.organization}</dd></div><div><dt>Granted</dt><dd>{selected.granted}</dd></div><div><dt>Expires</dt><dd>{selected.expires}</dd></div><div><dt>Status</dt><dd>{selected.status}</dd></div></dl><InfoNote tone="amber">Withdrawal immediately blocks new sharing under this purpose. Existing synthetic report files are not revoked in the browser demo.</InfoNote></> : null}
      </Modal>
      <ConfirmDialog open={Boolean(withdraw)} onClose={() => setWithdraw(null)} onConfirm={withdrawConsent} title="Withdraw this consent?" description="New processing or sharing under this purpose will be blocked immediately in the demo." confirmLabel="Withdraw consent" tone="danger">
        {withdraw ? <div className="fc-confirm-target"><strong>{withdraw.consumer}</strong><span>{withdraw.purpose} · {withdraw.organization}</span></div> : null}
      </ConfirmDialog>
    </div>
  );
}

export function AdminAuditLogsPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("all");
  const [selected, setSelected] = useState<(typeof ADMIN_AUDIT_LOGS)[number] | null>(null);
  const actions = Array.from(new Set(ADMIN_AUDIT_LOGS.map((event) => event.action)));
  const filtered = ADMIN_AUDIT_LOGS.filter((event) => (action === "all" || event.action === action) && (!search || `${event.actor} ${event.action} ${event.scope} ${event.requestId}`.toLowerCase().includes(search.toLowerCase())));

  function exportLogs() {
    downloadTextFile("finance-credibility-demo-audit-logs.csv", ["Time,Actor,Action,Scope,IP,Request ID", ...filtered.map((e) => `"${e.time}","${e.actor}","${e.action}","${e.scope}","${e.ip}","${e.requestId}"`)].join("\n"));
    showToast({ title: "Audit extract exported", message: "Synthetic CSV downloaded.", tone: "success" });
  }

  return (
    <div className="fc-page">
      <PageHeader eyebrow="Audit logs" title="Immutable operational history." description="Actor, action, target, request ID, and timestamp are recorded for sensitive operations in the production design." meta={<AdminMeta />} actions={<ActionButton variant="secondary" icon={<Download size={15} />} onClick={exportLogs}>Export audit extract</ActionButton>} />
      <div className="fc-stat-grid"><StatCard label="Events today" value="12" detail="Shown in this demo fixture" icon={<ListChecks size={20} />} tone="blue" /><StatCard label="Assessment reads" value="2" detail="Authorized synthetic access" icon={<Eye size={20} />} tone="green" /><StatCard label="Admin actions" value="5" detail="Generation, users, model draft" icon={<Wrench size={20} />} tone="violet" /><StatCard label="Security events" value="1" detail="Scheduled session cleanup" icon={<LockKeyhole size={20} />} tone="amber" /></div>
      <Card>
        <div className="fc-toolbar"><SearchInput value={search} onChange={setSearch} placeholder="Search actor, action, request ID" /><div className="fc-toolbar-filters"><label className="fc-filter"><span>Action</span><select value={action} onChange={(event) => setAction(event.target.value)}><option value="all">All actions</option>{actions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label></div></div>
        {filtered.length === 0 ? <EmptyState icon={<Search size={22} />} title="No audit events match" description="Adjust the search or action filter." /> : <div className="fc-table-wrap"><table className="fc-table"><thead><tr><th>Time (UTC)</th><th>Actor</th><th>Action</th><th>Scope</th><th>Request ID</th><th><span className="sr-only">View</span></th></tr></thead><tbody>{filtered.map((event) => <tr key={event.id}><td className="mono">{event.time}</td><td>{event.actor}</td><td><button type="button" className="fc-button-link" onClick={() => setSelected(event)}><code>{event.action}</code></button></td><td>{event.scope}</td><td className="mono fc-table-sub">{event.requestId}</td><td><button type="button" className="fc-icon-btn" onClick={() => setSelected(event)} aria-label={`View ${event.action}`}><Eye size={15} /></button></td></tr>)}</tbody></table></div>}
      </Card>
      <InfoNote tone="blue">Audit retention is bounded in production. Credentials, tokens, and sensitive payloads are redacted from event records.</InfoNote>
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title="Audit event detail" description="Synthetic immutable event record" footer={<ActionButton variant="secondary" onClick={() => setSelected(null)}>Close</ActionButton>}>
        {selected ? <><div className="fc-audit-detail"><div><span>Event ID</span><strong className="mono">{selected.id}</strong></div><div><span>Time</span><strong className="mono">{selected.time} UTC</strong></div><div><span>Actor</span><strong>{selected.actor}</strong></div><div><span>Action</span><strong><code>{selected.action}</code></strong></div><div><span>Scope</span><strong>{selected.scope}</strong></div><div><span>IP address</span><strong className="mono">{selected.ip}</strong></div><div><span>Request ID</span><strong className="mono">{selected.requestId}</strong></div><div><span>Outcome</span><strong>Success</strong></div></div><InfoNote tone="amber">This event is fictional and exists as a design fixture. No real user or applicant was accessed.</InfoNote></> : null}
      </Modal>
    </div>
  );
}

export function AdminSettingsPage() {
  const { showToast } = useToast();
  const [settings, setSettings] = useState({ maintenance: false, demoLogin: true, emailSimulation: true, syntheticReports: true, requireMfa: true, auditRetention: "365" });
  const [platform, setPlatform] = useState({ name: "Finance Credibility", environment: "Local demonstration", timezone: "UTC", support: "demo@fincred.example" });

  function save(event: FormEvent) {
    event.preventDefault();
    showToast({ title: "Demo settings saved", message: "System preferences are local to this demonstration.", tone: "success" });
  }

  return (
    <div className="fc-page">
      <PageHeader eyebrow="System settings" title="Platform configuration." description="Local demonstration controls. Production changes would require server-side role checks and audit events." meta={<AdminMeta />} actions={<ActionButton variant="primary" icon={<Check size={16} />} onClick={() => showToast({ title: "Demo settings saved", message: "System preferences are local to this demonstration.", tone: "success" })}>Save settings</ActionButton>} />
      <div className="fc-settings-grid">
        <Card>
          <CardHeader title="Platform profile" description="Labels used in the synthetic demo." />
          <form className="fc-form" onSubmit={save}><label className="fc-field"><span>Platform name</span><input value={platform.name} onChange={(event) => setPlatform({ ...platform, name: event.target.value })} /></label><label className="fc-field"><span>Environment</span><select value={platform.environment} onChange={(event) => setPlatform({ ...platform, environment: event.target.value })}><option>Local demonstration</option><option>Staging (demo)</option></select></label><div className="fc-form-grid"><label className="fc-field"><span>Time zone</span><select value={platform.timezone} onChange={(event) => setPlatform({ ...platform, timezone: event.target.value })}><option>UTC</option><option>Asia/Kolkata</option></select></label><label className="fc-field"><span>Support label</span><input value={platform.support} onChange={(event) => setPlatform({ ...platform, support: event.target.value })} /></label></div><ActionButton type="submit" variant="secondary" icon={<Check size={15} />}>Save platform profile</ActionButton></form>
        </Card>
        <Card>
          <CardHeader title="Operational controls" description="All controls are simulated in this prototype." />
          {[["maintenance", "Maintenance banner", "Show a demo maintenance notice on authenticated pages."], ["demoLogin", "Demo login", "Allow the seeded consumer, lender, and admin accounts."], ["emailSimulation", "Email simulation", "Show simulated recovery and support behavior."], ["syntheticReports", "Synthetic report exports", "Allow local CSV and print previews."]].map(([key, title, description]) => <div key={key} className="fc-setting-row"><div><strong>{title}</strong><p>{description}</p></div><button type="button" role="switch" aria-checked={settings[key as keyof typeof settings] as boolean} aria-label={title} className={`fc-switch ${settings[key as keyof typeof settings] ? "on" : ""}`} onClick={() => setSettings({ ...settings, [key]: !settings[key as keyof typeof settings] })}><span /></button></div>)}
        </Card>
        <Card>
          <CardHeader title="Security" description="Production requirements would be enforced server-side." />
          <div className="fc-setting-row"><div><strong>Require step-up authentication</strong><p>For model activation and account disabling.</p></div><button type="button" role="switch" aria-checked={settings.requireMfa} aria-label="Require step-up authentication" className={`fc-switch ${settings.requireMfa ? "on" : ""}`} onClick={() => setSettings({ ...settings, requireMfa: !settings.requireMfa })}><span /></button></div>
          <label className="fc-field"><span>Audit retention (days)</span><select value={settings.auditRetention} onChange={(event) => setSettings({ ...settings, auditRetention: event.target.value })}><option value="90">90 days</option><option value="180">180 days</option><option value="365">365 days</option></select></label>
          <div className="fc-security-list"><div><LockKeyhole size={16} /><span>Password hashing</span><strong>Argon2id design</strong></div><div><KeyRound size={16} /><span>Refresh rotation</span><strong>Reuse detection</strong></div><div><Fingerprint size={16} /><span>Admin role source</span><strong>Database only</strong></div></div>
        </Card>
        <Card>
          <CardHeader title="Data retention" description="Demo boundaries are explicit." />
          <div className="fc-retention-list"><div><span>Synthetic consumers</span><strong>Local fixtures</strong></div><div><span>Payment records</span><strong>Until demo reset</strong></div><div><span>Assessment snapshots</span><strong>Immutable</strong></div><div><span>Audit events</span><strong>Bounded retention</strong></div></div>
          <InfoNote tone="amber">Production startup would reject demo credentials and a missing signing secret.</InfoNote>
        </Card>
      </div>
    </div>
  );
}
