"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  Code2,
  Copy,
  Download,
  Eye,
  FileBarChart,
  FileText,
  Fingerprint,
  Gauge,
  KeyRound,
  LockKeyhole,
  Mail,
  Printer,
  Search,
  ShieldCheck,
  Target,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import {
  ActionButton,
  Badge,
  ButtonLink,
  Card,
  CardHeader,
  EmptyState,
  InfoNote,
  Modal,
  PageHeader,
  ProgressBar,
  ScoreGauge,
  SearchInput,
  StatCard,
  StatusBadge,
} from "@/frontend/components/finance/ui";
import {
  ApplicantVolumeChart,
  ScoreDistributionChart,
} from "@/frontend/components/finance/charts";
import {
  DEMO_APPLICANTS,
  DEMO_INDICATORS,
  DEMO_MODEL,
  LENDER_ASSESSMENTS,
  LENDER_MONTHLY_APPLICANTS,
  LENDER_SCORE_DISTRIBUTION,
  SYNTHETIC_BANNER,
  downloadTextFile,
  formatInr,
  reportCsvReport,
} from "@/frontend/lib/demo-data";
import { useToast } from "@/frontend/providers/ToastProvider";

const MEAN_SCORE = 731;

function LenderMeta() {
  return (
    <>
      <Badge tone="violet" dot>Demo Lender A</Badge>
      <span className="fc-meta-sep">·</span>
      <span>36 explicitly authorized applicants</span>
    </>
  );
}

export function LenderDashboardPage() {
  const recent = DEMO_APPLICANTS.slice(0, 6);
  return (
    <div className="fc-page">
      <PageHeader
        eyebrow="Overview"
        title="Authorized applicant workspace"
        description="Only active, explicitly authorized synthetic applicants appear here. No automated credit decision is produced."
        meta={<LenderMeta />}
        actions={<ButtonLink href="/lender/applicants" variant="primary"><Users size={16} /> View applicants</ButtonLink>}
      />
      <div className="fc-stat-grid">
        <StatCard label="Applicants" value="36" detail="Explicitly authorized" icon={<Users size={20} />} tone="blue" href="/lender/applicants" />
        <StatCard label="Mean illustrative score" value={String(MEAN_SCORE)} detail="Not a validated risk measure" icon={<Gauge size={20} />} tone="violet" href="/lender/assessments" />
        <StatCard label="Coverage: 6+ months" value="81%" detail="Of authorized applicants" icon={<ClipboardCheck size={20} />} tone="green" href="/lender/assessments" />
        <StatCard label="Assessments available" value="33" detail="Latest synthetic snapshots" icon={<FileText size={20} />} tone="amber" href="/lender/assessments" />
      </div>
      <div className="fc-dashboard-grid">
        <Card className="fc-span-2">
          <CardHeader
            title="Authorized applicant volume"
            description="Applicants and available assessments over the last six months."
            action={<Badge tone="green">+9 this quarter</Badge>}
          />
          <ApplicantVolumeChart data={LENDER_MONTHLY_APPLICANTS} />
        </Card>
        <Card>
          <CardHeader title="Score distribution" description="Illustrative bands, not risk grades." />
          <ScoreDistributionChart data={LENDER_SCORE_DISTRIBUTION} />
        </Card>
      </div>
      <div className="fc-dashboard-grid">
        <Card className="fc-span-2">
          <CardHeader
            title="Recent authorized applicants"
            description="Latest synthetic assessment snapshots."
            action={<Link href="/lender/applicants" className="fc-text-link">All applicants <ArrowRight size={14} /></Link>}
          />
          <div className="fc-table-wrap">
            <table className="fc-table">
              <thead><tr><th>Applicant</th><th>Score</th><th>Coverage</th><th>Punctuality</th><th>Assessed</th><th><span className="sr-only">View</span></th></tr></thead>
              <tbody>
                {recent.map((applicant) => (
                  <tr key={applicant.id}>
                    <td><Link href={`/lender/applicants/${applicant.id}`} className="fc-table-title"><span className="fc-applicant-avatar">{applicant.name.slice(-3)}</span>{applicant.name}</Link><span className="fc-table-sub">{applicant.location} · {applicant.employment}</span></td>
                    <td>{applicant.score ? <span className="fc-score-cell">{applicant.score}</span> : <Badge tone="slate">Insufficient</Badge>}</td>
                    <td>{applicant.score ? `${applicant.coverageMonths} months` : "Insufficient"}</td>
                    <td>{applicant.punctuality ? `${applicant.punctuality}%` : "—"}</td>
                    <td>{applicant.assessedAt}</td>
                    <td><Link href={`/lender/applicants/${applicant.id}`} className="fc-icon-btn" aria-label={`View ${applicant.name}`}><ChevronRight size={16} /></Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        <div className="fc-stack">
          <Card>
            <CardHeader title="Access policy" description="Every request is checked end to end." />
            <div className="fc-policy-list">
              {["Active organization membership", "Active applicant authorization", "Active consumer sharing consent", "Assessment lookup", "Audit event recorded"].map((item) => <div key={item}><CheckCircle2 size={15} /><span>{item}</span></div>)}
            </div>
          </Card>
          <Card>
            <CardHeader title="Report center" description="Synthetic portfolio exports." />
            <div className="fc-action-list">
              <Link href="/lender/reports" className="fc-action-row"><span><FileBarChart size={16} /></span><div><strong>Portfolio report</strong><p>Applicants, coverage, assessments</p></div><ChevronRight size={16} /></Link>
              <Link href="/lender/api" className="fc-action-row"><span><BookOpen size={16} /></span><div><strong>API documentation</strong><p>Authorization-aware endpoints</p></div><ChevronRight size={16} /></Link>
            </div>
          </Card>
        </div>
      </div>
      <InfoNote tone="amber" title="No automated lending decision">
        The illustrative assessment describes observed synthetic payment behaviour. It does not
        predict default, determine eligibility, set pricing, or recommend approval or rejection.
      </InfoNote>
    </div>
  );
}

export function LenderApplicantsPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [coverage, setCoverage] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => DEMO_APPLICANTS.filter((applicant) => {
    const coverageMatch =
      coverage === "all" ||
      (coverage === "6" && applicant.coverageMonths >= 6) ||
      (coverage === "12" && applicant.coverageMonths >= 12) ||
      (coverage === "insufficient" && applicant.score === null);
    return coverageMatch && (status === "all" || applicant.status === status) && (!search || `${applicant.name} ${applicant.email} ${applicant.location}`.toLowerCase().includes(search.toLowerCase()));
  }), [search, coverage, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const rows = filtered.slice((current - 1) * pageSize, current * pageSize);

  function exportList() {
    const content = ["Applicant,Score,Coverage,Punctuality,Assessed,Status", ...filtered.map((a) => `"${a.name}","${a.score ?? "Insufficient"}","${a.coverageMonths} months","${a.punctuality ?? ""}","${a.assessedAt}","${a.status}"`)].join("\n");
    downloadTextFile("demo-lender-authorized-applicants.csv", `${content}\n\n"${SYNTHETIC_BANNER}"`);
    showToast({ title: "Applicant list exported", message: "A synthetic CSV has been downloaded.", tone: "success" });
  }

  return (
    <div className="fc-page">
      <PageHeader
        eyebrow="Applicants"
        title="Authorized applicants"
        description="Demo Lender A / only active, authorized assignments are shown. Access is rechecked on every request."
        meta={<LenderMeta />}
        actions={<ActionButton variant="secondary" icon={<Download size={15} />} onClick={exportList}>Export list</ActionButton>}
      />
      <Card>
        <div className="fc-toolbar">
          <SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search fictional applicant" />
          <div className="fc-toolbar-filters">
            <label className="fc-filter"><span>Coverage</span><select value={coverage} onChange={(event) => { setCoverage(event.target.value); setPage(1); }}><option value="all">All</option><option value="6">6+ months</option><option value="12">12 months</option><option value="insufficient">Insufficient</option></select></label>
            <label className="fc-filter"><span>Authorization</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">All</option><option value="Authorized">Authorized</option><option value="Expiring soon">Expiring soon</option><option value="Insufficient data">Insufficient data</option></select></label>
          </div>
        </div>
        {rows.length === 0 ? <EmptyState icon={<Search size={22} />} title="No authorized applicants match" description="Adjust the search or filters. Unauthorized applicants are never shown." action={<ActionButton variant="secondary" onClick={() => { setSearch(""); setCoverage("all"); setStatus("all"); }}>Clear filters</ActionButton>} /> : (
          <>
            <div className="fc-table-wrap">
              <table className="fc-table">
                <thead><tr><th>Applicant</th><th>Score</th><th>Coverage</th><th>Punctuality</th><th>Assessed</th><th>Authorization</th><th><span className="sr-only">View</span></th></tr></thead>
                <tbody>
                  {rows.map((applicant) => (
                    <tr key={applicant.id}>
                      <td><Link href={`/lender/applicants/${applicant.id}`} className="fc-table-title"><span className="fc-applicant-avatar">{applicant.name.slice(-3)}</span>{applicant.name}</Link><span className="fc-table-sub">{applicant.location} · {applicant.employment}</span></td>
                      <td>{applicant.score ? <span className="fc-score-cell">{applicant.score}</span> : <Badge tone="slate">Insufficient</Badge>}</td>
                      <td>{applicant.score ? `${applicant.coverageMonths} months` : "Insufficient"}</td>
                      <td>{applicant.punctuality ? `${applicant.punctuality}%` : "—"}</td>
                      <td>{applicant.assessedAt}</td>
                      <td><StatusBadge status={applicant.status} /></td>
                      <td><Link href={`/lender/applicants/${applicant.id}`} className="fc-icon-btn" aria-label={`View ${applicant.name}`}><ChevronRight size={16} /></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="fc-pagination"><span>Showing {(current - 1) * pageSize + 1}–{Math.min(current * pageSize, filtered.length)} of {filtered.length}</span><div><button type="button" className="fc-icon-btn" onClick={() => setPage(Math.max(1, current - 1))} disabled={current === 1} aria-label="Previous page"><ChevronLeft size={16} /></button><span>Page {current} of {totalPages}</span><button type="button" className="fc-icon-btn" onClick={() => setPage(Math.min(totalPages, current + 1))} disabled={current === totalPages} aria-label="Next page"><ChevronRight size={16} /></button></div></div>
          </>
        )}
      </Card>
      <InfoNote tone="blue" title="Organization-scoped access">
        A guessed identifier never grants access. Lists, details, aggregates, and reports use the
        same authorization policy.
      </InfoNote>
    </div>
  );
}

interface ApplicantNote {
  id: string;
  applicantId: string;
  text: string;
  createdAt: string;
}

export function LenderApplicantDetailPage({ id }: { id: string }) {
  const { showToast } = useToast();
  const applicant = DEMO_APPLICANTS.find((item) => item.id === id);
  const [notes, setNotes] = useState<ApplicantNote[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem("finance-credibility-lender-notes") ?? "[]") as ApplicantNote[];
    } catch {
      return [];
    }
  });
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [assessmentOpen, setAssessmentOpen] = useState(false);

  if (!applicant) {
    return <div className="fc-page"><EmptyState icon={<Users size={22} />} title="Applicant unavailable" description="This applicant is not authorized for Demo Lender A or does not exist." action={<ButtonLink href="/lender/applicants" variant="primary">Return to applicants</ButtonLink>} /></div>;
  }

  const applicantNotes = notes.filter((note) => note.applicantId === applicant.id);

  function addNote(event: FormEvent) {
    event.preventDefault();
    if (!noteText.trim()) return;
    const next = [...notes, { id: `note-${Date.now()}`, applicantId: applicant!.id, text: noteText.trim(), createdAt: new Date().toISOString() }];
    setNotes(next);
    window.localStorage.setItem("finance-credibility-lender-notes", JSON.stringify(next));
    setNoteText("");
    setNoteOpen(false);
    showToast({ title: "Demo note stored", message: "The note exists in this browser only.", tone: "success" });
  }

  function exportApplicant() {
    downloadTextFile(`demo-applicant-${applicant!.id}.csv`, reportCsvReport(`Applicant summary — ${applicant!.name}`));
    showToast({ title: "Applicant summary exported", message: "Synthetic CSV downloaded.", tone: "success" });
  }

  return (
    <div className="fc-page">
      <PageHeader
        eyebrow="Applicant detail"
        title={applicant.name}
        description={`${applicant.location} · ${applicant.employment} · Requested ${formatInr(applicant.amount)}`}
        meta={<><StatusBadge status={applicant.status} /><span className="fc-meta-sep">·</span><span>Sharing consent until {applicant.consentExpiry}</span></>}
        actions={<><ButtonLink href="/lender/applicants" variant="secondary"><ArrowLeft size={16} /> Applicants</ButtonLink><ActionButton variant="primary" icon={<Download size={15} />} onClick={exportApplicant}>Export summary</ActionButton></>}
      />
      <div className="fc-applicant-hero">
        <Card className="fc-applicant-score-card">
          <ScoreGauge score={applicant.score} size="md" caption={applicant.score ? "Illustrative" : "Insufficient data"} />
          <div>
            <p className="fc-eyebrow">Latest assessment</p>
            <h2>{applicant.score ? `${applicant.score} / 900` : "Score withheld"}</h2>
            <p>{applicant.score ? `${applicant.coverageMonths} months · ${applicant.records} records · ${applicant.categories} categories` : "Fewer than 6 records or 3 observed billing months."}</p>
            <div className="fc-inline-badges"><Badge tone="blue">{DEMO_MODEL}</Badge><Badge tone="amber">Synthetic, unverified</Badge></div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Authorization" description="Access is current for this demo lender." />
          <div className="fc-authorization-list">
            <div><CheckCircle2 size={16} /><span>Active organization membership</span></div>
            <div><CheckCircle2 size={16} /><span>Active applicant assignment</span></div>
            <div><CheckCircle2 size={16} /><span>Consumer sharing consent active</span></div>
            <div><Clock3 size={16} /><span>Consent expires {applicant.consentExpiry}</span></div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Payment summary" />
          <div className="fc-applicant-facts">
            <div><span>Punctuality</span><strong>{applicant.punctuality ? `${applicant.punctuality}%` : "—"}</strong></div>
            <div><span>Coverage</span><strong>{applicant.coverageMonths} months</strong></div>
            <div><span>Records</span><strong>{applicant.records}</strong></div>
            <div><span>Assessed</span><strong>{applicant.assessedAt}</strong></div>
          </div>
        </Card>
      </div>

      <div className="fc-dashboard-grid">
        <Card className="fc-span-2">
          <CardHeader title="Illustrative indicator breakdown" description="Shown only as observed payment-behaviour descriptions." action={<ActionButton variant="secondary" size="sm" onClick={() => setAssessmentOpen(true)} icon={<Eye size={14} />}>Assessment detail</ActionButton>} />
          {applicant.score ? <div className="fc-lender-indicator-grid">{DEMO_INDICATORS.slice(0, 8).map((indicator, index) => <div key={indicator.name} className="fc-lender-indicator"><div><span>{indicator.name}</span><strong>{Math.max(60, indicator.value - (index % 3) * 4)}</strong></div><ProgressBar value={Math.max(60, indicator.value - (index % 3) * 4)} tone={index < 2 ? "green" : "blue"} /></div>)}</div> : <EmptyState icon={<AlertTriangle size={22} />} title="Insufficient data for an assessment" description="A score is withheld when coverage is below the minimum. Missing records are unknown, not missed." />}
        </Card>
        <div className="fc-stack">
          <Card>
            <CardHeader title="Reason codes" />
            <div className="fc-reason-list">
              {applicant.score ? <><div className="positive"><CheckCircle2 size={16} /><span>High recorded punctuality across settled records</span></div><div className="positive"><CheckCircle2 size={16} /><span>Coverage meets the illustrative 6-month threshold</span></div><div className="warning"><AlertTriangle size={16} /><span>Two late electricity settlements in the last 12 months</span></div><div className="neutral"><InfoNoteIcon /><span>Self-recorded synthetic data; no external verification</span></div></> : <div className="neutral"><AlertTriangle size={16} /><span>Insufficient records for a reliable illustrative assessment</span></div>}
            </div>
          </Card>
          <Card>
            <CardHeader title="Data quality" />
            <div className="fc-data-quality">
              <div><span>Completeness</span><strong>{applicant.score ? "100%" : "38%"}</strong></div>
              <div><span>Freshness</span><strong>0 days</strong></div>
              <div><span>Verification</span><strong>None</strong></div>
              <div><span>Source</span><strong>Self-recorded</strong></div>
            </div>
          </Card>
        </div>
      </div>

      <div className="fc-dashboard-grid">
        <Card>
          <CardHeader title="Applicant context" description="Synthetic data only." />
          <dl className="fc-detail-list"><div><dt>Applicant ID</dt><dd className="mono">{applicant.id}</dd></div><div><dt>Email</dt><dd>{applicant.email}</dd></div><div><dt>Phone</dt><dd>{applicant.phone}</dd></div><div><dt>Requested amount</dt><dd>{formatInr(applicant.amount)}</dd></div><div><dt>Purpose</dt><dd>{applicant.purpose}</dd></div><div><dt>Annual income</dt><dd>{formatInr(applicant.income * 12)}</dd></div></dl>
          <InfoNote tone="amber">These details are fictional. This workspace does not provide an approval recommendation.</InfoNote>
        </Card>
        <Card>
          <CardHeader title="Review notes" description="Stored locally for this demo lender." action={<ActionButton variant="secondary" size="sm" onClick={() => setNoteOpen(true)}>Add note</ActionButton>} />
          {applicantNotes.length === 0 ? <EmptyState icon={<ClipboardList size={22} />} title="No demo notes" description="Add a fictional note for this review session." action={<ActionButton variant="secondary" onClick={() => setNoteOpen(true)}>Add the first note</ActionButton>} /> : <div className="fc-note-list">{applicantNotes.map((note) => <div key={note.id}><p>{note.text}</p><span>{new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(note.createdAt))}</span></div>)}</div>}
          <div className="fc-access-audit"><Fingerprint size={16} /><span>This demo view represents an ASSESSMENT_READ audit event.</span></div>
        </Card>
      </div>

      <Modal open={noteOpen} onClose={() => setNoteOpen(false)} title="Add a demo note" description="Notes remain in this browser and are never sent to a real organization." footer={<><ActionButton variant="secondary" onClick={() => setNoteOpen(false)}>Cancel</ActionButton><ActionButton variant="primary" onClick={addNote}>Store note</ActionButton></>}>
        <label className="fc-field"><span>Note</span><textarea rows={5} value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Record a fictional review note..." /></label>
      </Modal>
      <Modal open={assessmentOpen} onClose={() => setAssessmentOpen(false)} title="Assessment detail" description={`${applicant.name} · ${DEMO_MODEL} · synthetic snapshot`} size="lg" footer={<><ActionButton variant="secondary" onClick={() => setAssessmentOpen(false)}>Close</ActionButton><ActionButton variant="primary" icon={<Download size={15} />} onClick={exportApplicant}>Export summary</ActionButton></>}>
        <div className="fc-report-preview-head"><div><p>Illustrative assessment</p><h2>{applicant.score ? `${applicant.score} / 900` : "Score withheld"}</h2></div><Badge tone="amber">SYNTHETIC</Badge></div>
        <div className="fc-report-preview-grid"><div><span>Coverage</span><strong>{applicant.coverageMonths} months</strong></div><div><span>Records</span><strong>{applicant.records}</strong></div><div><span>Punctuality</span><strong>{applicant.punctuality ? `${applicant.punctuality}%` : "—"}</strong></div><div><span>Assessment date</span><strong>{applicant.assessedAt}</strong></div></div>
        <table className="fc-table"><thead><tr><th>Indicator</th><th>Value</th><th>Weight</th></tr></thead><tbody>{DEMO_INDICATORS.map((indicator, index) => <tr key={indicator.name}><td>{indicator.name}</td><td>{Math.max(60, indicator.value - (index % 3) * 4)}/100</td><td>{indicator.weight}</td></tr>)}</tbody></table>
        <p className="fc-report-footnote">{SYNTHETIC_BANNER}</p>
      </Modal>
    </div>
  );
}

function InfoNoteIcon() {
  return <ShieldCheck size={16} />;
}

export function LenderAssessmentsPage() {
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = LENDER_ASSESSMENTS.filter((assessment) => (status === "all" || assessment.status === status) && (!search || assessment.applicant.toLowerCase().includes(search.toLowerCase())));

  function exportAssessments() {
    downloadTextFile("demo-lender-assessments.csv", ["Applicant,Score,Model,Assessed,Coverage,Status", ...filtered.map((item) => `"${item.applicant}","${item.score ?? "Insufficient"}","${item.model}","${item.assessedAt}","${item.coverage}","${item.status}"`)].join("\n"));
    showToast({ title: "Assessments exported", message: "Synthetic assessment list downloaded.", tone: "success" });
  }

  return (
    <div className="fc-page">
      <PageHeader eyebrow="Assessments" title="Assessment snapshots" description="Immutable synthetic assessment references for explicitly authorized applicants." meta={<LenderMeta />} actions={<ActionButton variant="secondary" icon={<Download size={15} />} onClick={exportAssessments}>Export assessments</ActionButton>} />
      <div className="fc-stat-grid">
        <StatCard label="Available assessments" value="33" detail="Latest authorized snapshots" icon={<ClipboardCheck size={20} />} tone="green" />
        <StatCard label="Model version" value={DEMO_MODEL} detail="Experimental · versioned" icon={<Gauge size={20} />} tone="blue" />
        <StatCard label="Insufficient data" value="3" detail="Score correctly withheld" icon={<AlertTriangle size={20} />} tone="amber" />
        <StatCard label="Consent expiring" value="4" detail="Within the next 30 days" icon={<Clock3 size={20} />} tone="violet" />
      </div>
      <Card>
        <div className="fc-toolbar"><SearchInput value={search} onChange={setSearch} placeholder="Search applicant" /><div className="fc-toolbar-filters"><label className="fc-filter"><span>Status</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All</option><option value="Complete">Complete</option><option value="Insufficient data">Insufficient data</option></select></label></div></div>
        {filtered.length === 0 ? <EmptyState icon={<Search size={22} />} title="No assessments match" description="Adjust the search or status filter." /> : <div className="fc-table-wrap"><table className="fc-table"><thead><tr><th>Applicant</th><th>Score</th><th>Model</th><th>Coverage</th><th>Assessed</th><th>Status</th><th><span className="sr-only">View</span></th></tr></thead><tbody>{filtered.map((assessment) => <tr key={assessment.id}><td><Link href={`/lender/applicants/${assessment.applicantId}`} className="fc-table-title">{assessment.applicant}</Link><span className="fc-table-sub mono">{assessment.id}</span></td><td>{assessment.score ? <span className="fc-score-cell">{assessment.score}</span> : <Badge tone="slate">Insufficient</Badge>}</td><td><code>{assessment.model}</code></td><td>{assessment.coverage}</td><td>{assessment.assessedAt}</td><td><StatusBadge status={assessment.status} /></td><td><Link href={`/lender/applicants/${assessment.applicantId}`} className="fc-icon-btn" aria-label={`View ${assessment.applicant}`}><ChevronRight size={16} /></Link></td></tr>)}</tbody></table></div>}
      </Card>
      <InfoNote tone="blue">Historical assessments are immutable. A new model version never silently rewrites an existing snapshot.</InfoNote>
    </div>
  );
}

const LENDER_REPORTS = [
  { id: "lr-1", title: "Portfolio overview", description: "Applicant count, coverage, assessment availability, and illustrative score distribution.", format: "PDF", period: "November 2026" },
  { id: "lr-2", title: "Authorized applicant register", description: "Applicant labels, assessment dates, scores, coverage, and consent expiry.", format: "CSV", period: "November 2026" },
  { id: "lr-3", title: "Assessment coverage", description: "Data completeness, insufficient-data counts, and model version references.", format: "PDF", period: "Last 6 months" },
  { id: "lr-4", title: "Access audit extract", description: "Fictional assessment reads and report exports for this demo organization.", format: "CSV", period: "Last 30 days" },
];

export function LenderReportsPage() {
  const { showToast } = useToast();
  const [selected, setSelected] = useState<(typeof LENDER_REPORTS)[number] | null>(null);
  const [period, setPeriod] = useState("6");

  function download(report: (typeof LENDER_REPORTS)[number]) {
    downloadTextFile(`demo-lender-${report.id}.csv`, reportCsvReport(report.title));
    showToast({ title: "Synthetic report downloaded", message: `${report.title} (${report.format} demo) generated as CSV.`, tone: "success" });
  }

  return (
    <div className="fc-page">
      <PageHeader eyebrow="Reports" title="Portfolio reporting with explicit permission checks." description="Every report checks organization membership, applicant authorization, and sharing consent at generation time." meta={<LenderMeta />} actions={<Badge tone="amber" dot>Synthetic exports</Badge>} />
      <div className="fc-range-bar"><div className="fc-range-presets">{["30 days", "3 months", "6 months", "12 months"].map((label, index) => <button type="button" key={label} className={period === String(index + 1) ? "active" : ""} onClick={() => setPeriod(String(index + 1))}>{label}</button>)}</div><span>Every report uses the selected period.</span></div>
      <div className="fc-report-grid">
        {LENDER_REPORTS.map((report) => (
          <Card key={report.id} className="fc-report-card">
            <div className="fc-report-top"><span className="fc-report-icon"><FileBarChart size={21} /></span><Badge tone={report.format === "PDF" ? "violet" : "green"}>{report.format}</Badge></div>
            <h3>{report.title}</h3><p>{report.description}</p>
            <div className="fc-report-meta"><span>{report.period}</span><span>Demo Lender A</span></div>
            <div className="fc-report-actions"><ActionButton variant="secondary" size="sm" icon={<Printer size={14} />} onClick={() => setSelected(report)}>Preview</ActionButton><ActionButton variant="ghost" size="sm" icon={<Download size={14} />} onClick={() => download(report)}>CSV</ActionButton></div>
          </Card>
        ))}
      </div>
      <InfoNote tone="blue" title="Permissions are rechecked at generation">
        Export access is not cached from the list view. A revoked authorization immediately blocks a
        new report in the production design.
      </InfoNote>
      <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? "Report preview"} description="Synthetic lender report preview." size="lg" footer={<><ActionButton variant="secondary" onClick={() => setSelected(null)}>Close</ActionButton><ActionButton variant="primary" icon={<Printer size={15} />} onClick={() => window.print()}>Print / Save PDF</ActionButton></>}>
        {selected ? <div className="fc-print-area"><div className="fc-report-preview-head"><div><p>Demo Lender A</p><h2>{selected.title}</h2></div><Badge tone="amber">SYNTHETIC</Badge></div><p className="fc-report-disclaimer">{SYNTHETIC_BANNER}</p><div className="fc-report-preview-grid"><div><span>Organization</span><strong>Demo Lender A</strong></div><div><span>Period</span><strong>{selected.period}</strong></div><div><span>Authorized applicants</span><strong>36</strong></div><div><span>Mean illustrative score</span><strong>731</strong></div></div><table className="fc-table"><thead><tr><th>Applicant</th><th>Score</th><th>Coverage</th><th>Status</th></tr></thead><tbody>{DEMO_APPLICANTS.slice(0, 8).map((applicant) => <tr key={applicant.id}><td>{applicant.name}</td><td>{applicant.score ?? "Insufficient"}</td><td>{applicant.coverageMonths} months</td><td>{applicant.status}</td></tr>)}</tbody></table><p className="fc-report-footnote">No automated lending recommendation is included. Not a validated risk measure.</p></div> : null}
      </Modal>
    </div>
  );
}

const ENDPOINTS = [
  { method: "GET", path: "/api/lender/dashboard", description: "Authorized portfolio counts and coverage." },
  { method: "GET", path: "/api/lender/applicants", description: "Paginated authorized applicant list." },
  { method: "GET", path: "/api/lender/applicants/{id}", description: "Applicant detail with latest assessment and reason codes." },
  { method: "GET", path: "/api/lender/assessments/{id}", description: "Immutable assessment snapshot." },
  { method: "GET", path: "/api/lender/reports/{type}", description: "Permission-checked synthetic report export." },
];

export function LenderApiPage() {
  const { showToast } = useToast();
  const [copied, setCopied] = useState("");

  function copy(value: string, label: string) {
    void navigator.clipboard.writeText(value);
    setCopied(label);
    showToast({ title: "Copied", message: `${label} copied to the clipboard.`, tone: "info" });
    window.setTimeout(() => setCopied(""), 1600);
  }

  const curl = `curl -H "Cookie: fincred_session=<demo-session>" \\
  http://localhost:3000/api/lender/applicants`;

  return (
    <div className="fc-page">
      <PageHeader eyebrow="API documentation" title="Lender API surface" description="A design contract for organization-scoped, consent-aware applicant access. These endpoints describe the intended production API; the current demo uses synthetic fixtures." meta={<><Badge tone="violet" dot>Demo Lender A</Badge><span className="fc-meta-sep">·</span><span>API v1 draft</span></>} actions={<ActionButton variant="secondary" icon={<Download size={15} />} onClick={() => { downloadTextFile("finance-credibility-lender-api.md", `# Finance Credibility Lender API\n\n${SYNTHETIC_BANNER}\n\n${ENDPOINTS.map((e) => `${e.method} ${e.path} — ${e.description}`).join("\n")}\n`); showToast({ title: "API outline downloaded", tone: "success" }); }}>Download outline</ActionButton>} />
      <div className="fc-api-grid">
        <Card className="fc-span-2">
          <CardHeader title="Endpoints" description="All responses use a data + pagination envelope. Errors include code, message, field_errors, and request_id." />
          <div className="fc-endpoint-list">
            {ENDPOINTS.map((endpoint) => (
              <div key={endpoint.path} className="fc-endpoint"><span className={`fc-method fc-method-${endpoint.method.toLowerCase()}`}>{endpoint.method}</span><code>{endpoint.path}</code><p>{endpoint.description}</p><button type="button" className="fc-icon-btn" onClick={() => copy(endpoint.path, endpoint.path)} aria-label={`Copy ${endpoint.path}`}>{copied === endpoint.path ? <Check size={15} /> : <Copy size={15} />}</button></div>
            ))}
          </div>
        </Card>
        <div className="fc-stack">
          <Card><CardHeader title="Authentication" /><p className="fc-card-description">Demo session cookies are HttpOnly. A production design would use short-lived signed JWTs and rotated refresh-token hashes.</p><div className="fc-code-line"><code>Cookie: fincred_session=…</code><button type="button" className="fc-icon-btn" onClick={() => copy("Cookie: fincred_session=<demo-session>", "Cookie header")} aria-label="Copy cookie header"><Copy size={15} /></button></div></Card>
          <Card><CardHeader title="Authorization chain" /><div className="fc-policy-list">{["Authenticated lender", "Active organization membership", "Active applicant authorization", "Active consumer sharing consent", "Assessment lookup", "Access audit event"].map((item) => <div key={item}><CheckCircle2 size={15} /><span>{item}</span></div>)}</div></Card>
        </div>
      </div>
      <div className="fc-api-lower">
        <Card><CardHeader title="Example request" action={<button type="button" className="fc-btn fc-btn-ghost fc-btn-sm" onClick={() => copy(curl, "curl example")}><Copy size={14} /> Copy</button>} /><pre className="fc-code-block"><code>{curl}</code></pre></Card>
        <Card><CardHeader title="Error envelope" /><pre className="fc-code-block"><code>{`{
  "error": {
    "code": "forbidden",
    "message": "Applicant access is not authorized.",
    "field_errors": {},
    "request_id": "req_8f29c"
  }
}`}</code></pre><InfoNote tone="amber">A guessed UUID never grants access. Authorization is checked server-side on every request.</InfoNote></Card>
      </div>
      <Card><CardHeader title="Response example" /><pre className="fc-code-block"><code>{`{
  "data": [
    {
      "id": "app-001",
      "identity_label": "Demo Consumer 001",
      "score": 782,
      "coverage_months": 12,
      "punctuality": 94,
      "authorization": "active",
      "assessed_at": "2026-11-11T09:30:00Z"
    }
  ],
  "pagination": { "page": 1, "page_size": 20, "total": 36 }
}`}</code></pre></Card>
    </div>
  );
}

export function LenderSettingsPage() {
  const { showToast } = useToast();
  const [org, setOrg] = useState({ name: "Demo Lender A", code: "DEMO-A", contact: "Priya Nair", email: "lender@fincred.demo", timezone: "Asia/Kolkata", reportFormat: "CSV" });
  const [notifications, setNotifications] = useState({ newApplicant: true, consentExpiry: true, reportReady: false, weeklyDigest: true });

  function save(event: FormEvent) {
    event.preventDefault();
    showToast({ title: "Demo organization settings saved", message: "Changes are local to this session.", tone: "success" });
  }

  return (
    <div className="fc-page">
      <PageHeader eyebrow="Settings" title="Organization settings" description="Manage the synthetic Demo Lender A workspace. Membership, authorization, and report access are separate from these preferences." actions={<Badge tone="violet" dot>Organization isolated</Badge>} />
      <div className="fc-settings-grid">
        <Card>
          <CardHeader title="Organization profile" description="Fictional details used throughout the lender demo." />
          <form className="fc-form" onSubmit={save}>
            <div className="fc-form-grid"><label className="fc-field"><span>Organization name</span><input value={org.name} onChange={(event) => setOrg({ ...org, name: event.target.value })} /></label><label className="fc-field"><span>Organization code</span><input value={org.code} onChange={(event) => setOrg({ ...org, code: event.target.value })} /></label></div>
            <div className="fc-form-grid"><label className="fc-field"><span>Primary contact</span><input value={org.contact} onChange={(event) => setOrg({ ...org, contact: event.target.value })} /></label><label className="fc-field"><span>Demo contact email</span><input type="email" value={org.email} onChange={(event) => setOrg({ ...org, email: event.target.value })} /></label></div>
            <div className="fc-form-grid"><label className="fc-field"><span>Time zone</span><select value={org.timezone} onChange={(event) => setOrg({ ...org, timezone: event.target.value })}><option>Asia/Kolkata</option><option>UTC</option><option>Asia/Singapore</option></select></label><label className="fc-field"><span>Default report format</span><select value={org.reportFormat} onChange={(event) => setOrg({ ...org, reportFormat: event.target.value })}><option>CSV</option><option>PDF</option></select></label></div>
            <div className="fc-form-actions"><ActionButton type="submit" variant="primary" icon={<Check size={16} />}>Save organization settings</ActionButton></div>
          </form>
        </Card>
        <Card>
          <CardHeader title="Notifications" description="In-app synthetic demo preferences." />
          {[["newApplicant", "New authorized applicant", "When a synthetic applicant authorization becomes active."], ["consentExpiry", "Consent expiry", "When an applicant sharing grant is nearing expiry."], ["reportReady", "Report ready", "When a synthetic report export is prepared."], ["weeklyDigest", "Weekly portfolio digest", "A fictional weekly summary of coverage changes."]].map(([key, title, description]) => <div key={key} className="fc-setting-row"><div><strong>{title}</strong><p>{description}</p></div><button type="button" role="switch" aria-checked={notifications[key as keyof typeof notifications]} aria-label={title} className={`fc-switch ${notifications[key as keyof typeof notifications] ? "on" : ""}`} onClick={() => setNotifications({ ...notifications, [key]: !notifications[key as keyof typeof notifications] })}><span /></button></div>)}
        </Card>
        <Card>
          <CardHeader title="Security boundary" description="Visible controls, server-side enforcement." />
          <div className="fc-security-list"><div><LockKeyhole size={16} /><span>Session window</span><strong>8 hours</strong></div><div><KeyRound size={16} /><span>Step-up authentication</span><strong>Simulated</strong></div><div><Fingerprint size={16} /><span>Audit events</span><strong>Assessment reads + exports</strong></div><div><ShieldCheck size={16} /><span>Organization isolation</span><strong>Enforced per request</strong></div></div>
          <InfoNote tone="blue">There is no Team Management area in this prototype. Organization access is represented by the seeded demo role.</InfoNote>
        </Card>
        <Card>
          <CardHeader title="Data and retention" description="Synthetic demo boundaries." />
          <div className="fc-retention-list"><div><span>Applicant records</span><strong>Fictional fixtures</strong></div><div><span>Assessments</span><strong>Immutable snapshots</strong></div><div><span>Report exports</span><strong>Local downloads</strong></div><div><span>Audit retention</span><strong>Demo only</strong></div></div>
        </Card>
      </div>
    </div>
  );
}
