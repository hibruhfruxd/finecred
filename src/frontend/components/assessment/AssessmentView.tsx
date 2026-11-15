"use client";

import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarRange,
  Check,
  CircleDashed,
  Database,
  Gauge,
  Info,
  Layers3,
  Loader2,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { CategoryIcon } from "@/frontend/components/ui/CategoryIcon";
import { ScoreGauge } from "@/frontend/components/ui/ScoreGauge";
import { ClientApiError, apiRequest } from "@/frontend/lib/api";
import { CATEGORY_DEFINITIONS, DEMO_DISCLAIMER } from "@/models/domain";
import { formatCurrency, formatDateTime } from "@/frontend/lib/format";
import type { AssessmentResponseDto, TransactionSummaryDto } from "@/models/api";

const LOOKBACK_OPTIONS = [3, 6, 12, 24];

function scoreTone(score: number | null): string {
  if (score === null) return "unavailable";
  if (score >= 85) return "strong";
  if (score >= 70) return "good";
  if (score >= 55) return "fair";
  if (score >= 40) return "developing";
  return "limited";
}

function factorStatusLabel(status: "strong" | "moderate" | "needs_data"): string {
  if (status === "strong") return "Strong signal";
  if (status === "moderate") return "Moderate";
  return "Needs data";
}

export function AssessmentView() {
  const [summary, setSummary] = useState<TransactionSummaryDto | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [lookbackMonths, setLookbackMonths] = useState(6);
  const [result, setResult] = useState<AssessmentResponseDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadSummary = useCallback(async (signal?: AbortSignal) => {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const data = await apiRequest<TransactionSummaryDto>("/api/transactions/summary", {
        signal,
      });
      setSummary(data);
    } catch (requestError) {
      if (signal?.aborted) return;
      setSummaryError(
        requestError instanceof ClientApiError
          ? requestError.message
          : "The demo data snapshot could not be loaded.",
      );
    } finally {
      if (!signal?.aborted) setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadSummary(controller.signal);
    return () => controller.abort();
  }, [loadSummary]);

  const generateAssessment = useCallback(async () => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await apiRequest<AssessmentResponseDto>("/api/assessment/generate", {
        method: "POST",
        body: JSON.stringify({ lookback_months: lookbackMonths }),
      });
      setResult(data);
      window.setTimeout(() => {
        document.getElementById("assessment-result")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 80);
    } catch (requestError) {
      setError(
        requestError instanceof ClientApiError
          ? requestError.message
          : "The illustrative assessment could not be generated. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [lookbackMonths]);

  const ready = summary?.assessment.ready ?? false;
  const tone = result ? scoreTone(result.score) : "unavailable";
  const ruleCompliant = result?.status === "completed";

  return (
    <div className="assessment-view">
      <section className="card assessment-control">
        <div className="assessment-control-main">
          <div className="assessment-control-icon">
            <Sparkles size={20} aria-hidden="true" />
          </div>
          <div>
            <h2>Generate an illustrative credibility assessment</h2>
            <p>
              The configured assessment engine reviews your synthetic payments in the selected
              window and returns a score, explanation factors, data coverage, and gaps.
            </p>
            <div className="assessment-engine-chip">
              <ShieldAlert size={14} aria-hidden="true" />
              Reference baseline engine · provisional · Devansh integration pending
            </div>
          </div>
        </div>

        <div className="assessment-control-actions">
          <label className="lookback-control" htmlFor="lookback">
            <span>Assessment window</span>
            <select
              id="lookback"
              value={lookbackMonths}
              onChange={(event) => setLookbackMonths(Number(event.target.value))}
              disabled={loading}
            >
              {LOOKBACK_OPTIONS.map((months) => (
                <option key={months} value={months}>
                  Last {months} month{months === 1 ? "" : "s"}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => void generateAssessment()}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={17} className="spin" aria-hidden="true" />
                Running engine…
              </>
            ) : result ? (
              <>
                <RefreshCw size={16} aria-hidden="true" />
                Recalculate
              </>
            ) : (
              <>
                <Gauge size={17} aria-hidden="true" />
                Generate assessment
              </>
            )}
          </button>
        </div>
      </section>

      <section className="assessment-snapshot">
        <article className="card snapshot-card">
          <span className="snapshot-icon">
            <Database size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="snapshot-label">Synthetic payments</p>
            <p className="snapshot-value">
              {summaryLoading ? "—" : (summary?.totals.transactions ?? 0)}
            </p>
            <p className="snapshot-foot">
              {summaryError ? "Snapshot unavailable" : "Across the full demo account"}
            </p>
          </div>
        </article>
        <article className="card snapshot-card">
          <span className="snapshot-icon">
            <Layers3 size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="snapshot-label">Categories covered</p>
            <p className="snapshot-value">
              {summaryLoading ? "—" : (summary?.totals.categoriesUsed ?? 0)}
              <span className="snapshot-suffix"> / 3</span>
            </p>
            <p className="snapshot-foot">
              {summaryError ? "Snapshot unavailable" : "Rent, electricity, mobile"}
            </p>
          </div>
        </article>
        <article className="card snapshot-card">
          <span className="snapshot-icon">
            <Target size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="snapshot-label">Data readiness</p>
            <p className={`snapshot-value snapshot-value-sm ${ready ? "text-success" : "text-warning"}`}>
              {summaryLoading ? "Checking…" : ready ? "Ready" : "More data needed"}
            </p>
            <p className="snapshot-foot">
              {ready ? "Minimum demo requirements met" : "Minimum 3 payments / 2 categories"}
            </p>
          </div>
        </article>
        <article className="card snapshot-card">
          <span className="snapshot-icon">
            <TrendingUp size={18} aria-hidden="true" />
          </span>
          <div>
            <p className="snapshot-label">Recorded value</p>
            <p className="snapshot-value snapshot-value-money">
              {summaryLoading ? "—" : formatCurrency(summary?.totals.totalAmount ?? 0)}
            </p>
            <p className="snapshot-foot">Synthetic payment total</p>
          </div>
        </article>
      </section>

      {summary?.assessment.requirements.length && !ready ? (
        <section className="readiness-banner" role="status">
          <div>
            <strong>Before you generate</strong>
            <p>
              The reference engine returns an insufficient-data state until both minimum
              requirements are met. You can still generate to preview that state.
            </p>
          </div>
          <ul>
            {summary.assessment.requirements.map((requirement) => (
              <li key={requirement.id} className={requirement.met ? "met" : ""}>
                {requirement.met ? <Check size={14} /> : <CircleDashed size={14} />}
                {requirement.detail}
              </li>
            ))}
          </ul>
          {!ready ? (
            <Link href="/payments/new/rent" className="btn btn-secondary btn-sm">
              <Plus size={15} aria-hidden="true" />
              Add payment
            </Link>
          ) : null}
        </section>
      ) : null}

      {loading ? (
        <section className="card assessment-loading" aria-busy="true" aria-live="polite">
          <div className="assessment-loading-gauge">
            <div className="skeleton skeleton-gauge" />
          </div>
          <div className="assessment-loading-copy">
            <p className="eyebrow">Running reference engine</p>
            <h2>Building your illustrative scorecard…</h2>
            <ul>
              <li>
                <Loader2 size={15} className="spin" aria-hidden="true" />
                Collecting synthetic transactions in the selected window
              </li>
              <li>
                <Loader2 size={15} className="spin" aria-hidden="true" />
                Calculating explanation factors and data coverage
              </li>
              <li>
                <Loader2 size={15} className="spin" aria-hidden="true" />
                Preparing disclaimer and engine provenance
              </li>
            </ul>
          </div>
        </section>
      ) : null}

      {!loading && error ? (
        <section className="card state-card" role="alert">
          <span className="state-icon state-icon-error">
            <AlertTriangle size={22} />
          </span>
          <h2>Assessment could not be generated</h2>
          <p>{error}</p>
          <div className="state-card-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => void generateAssessment()}
            >
              <RefreshCw size={16} aria-hidden="true" />
              Retry assessment
            </button>
            <Link href="/transactions" className="btn btn-secondary">
              Review transactions
            </Link>
          </div>
        </section>
      ) : null}

      {!loading && result ? (
        <div id="assessment-result" className="assessment-result">
          {result.status === "insufficient_data" ? (
            <section className={`card insufficient-card insufficient-${tone}`}>
              <div className="insufficient-visual">
                <ScoreGauge score={null} band="Unavailable" size={210} />
              </div>
              <div className="insufficient-copy">
                <span className="badge badge-warning">
                  <AlertTriangle size={14} aria-hidden="true" />
                  Insufficient data
                </span>
                <h2>Not enough synthetic history yet</h2>
                <p>{result.summary}</p>

                <div className="insufficient-requirements">
                  <h3>Assessment requirements</h3>
                  <ul>
                    {result.requirements.map((requirement) => (
                      <li key={requirement.id} className={requirement.met ? "met" : ""}>
                        <span className="requirement-check" aria-hidden="true">
                          {requirement.met ? <Check size={14} /> : <CircleDashed size={14} />}
                        </span>
                        <span>
                          <strong>{requirement.label}</strong>
                          <span>{requirement.detail}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="insufficient-actions">
                  <Link href="/payments/new/rent" className="btn btn-primary">
                    <Plus size={16} aria-hidden="true" />
                    Add synthetic payment
                  </Link>
                  <Link href="/transactions" className="btn btn-secondary">
                    View payment history
                  </Link>
                </div>
              </div>

              <div className="insufficient-side">
                <div className="coverage-compact">
                  <p className="eyebrow">Data coverage</p>
                  <div className="coverage-number">
                    {result.dataCoverage.percentage}
                    <span>%</span>
                  </div>
                  <div className="coverage-level">{result.dataCoverage.level}</div>
                  <div
                    className="progress-track"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={result.dataCoverage.percentage}
                    aria-label="Data coverage"
                  >
                    <span style={{ width: `${result.dataCoverage.percentage}%` }} />
                  </div>
                  <p className="coverage-note">
                    {result.processedTransactions} synthetic transaction
                    {result.processedTransactions === 1 ? "" : "s"} processed in the last{" "}
                    {result.lookbackMonths} months.
                  </p>
                </div>

                {result.dataGaps.length > 0 ? (
                  <div className="data-gaps-compact">
                    <p className="eyebrow">What is missing</p>
                    <ul>
                      {result.dataGaps.slice(0, 5).map((gap) => (
                        <li key={gap}>
                          <Info size={13} aria-hidden="true" />
                          {gap}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </section>
          ) : (
            <>
              <section className={`scorecard-hero scorecard-hero-${tone}`}>
                <div className="scorecard-gauge-wrap">
                  <ScoreGauge score={result.score} band={result.band} size={252} />
                </div>

                <div className="scorecard-hero-copy">
                  <div className="scorecard-hero-topline">
                    <p className="eyebrow">Illustrative financial credibility</p>
                    <span className={`badge badge-score badge-score-${tone}`}>{result.band}</span>
                  </div>
                  <h2>{result.band} illustrative signal</h2>
                  <p className="scorecard-interpretation">{result.interpretation}</p>
                  <p className="scorecard-summary">{result.summary}</p>
                  <div className="scorecard-meta">
                    <span>
                      <Database size={14} aria-hidden="true" />
                      {result.processedTransactions} transactions analysed
                    </span>
                    <span>
                      <CalendarRange size={14} aria-hidden="true" />
                      Last {result.lookbackMonths} months
                    </span>
                    <span>
                      <BarChart3 size={14} aria-hidden="true" />
                      {result.dataCoverage.percentage}% data coverage
                    </span>
                  </div>
                </div>

                <div className="scorecard-hero-side">
                  <div className="scorecard-side-card">
                    <p className="eyebrow">Data coverage</p>
                    <div
                      className="coverage-ring"
                      style={{ "--coverage": `${result.dataCoverage.percentage}%` } as CSSProperties}
                    >
                      <span>{result.dataCoverage.percentage}%</span>
                    </div>
                    <p className="coverage-level">{result.dataCoverage.level}</p>
                    <p className="coverage-note">
                      Weighted evidence across volume, categories, history, documents, and
                      platforms.
                    </p>
                  </div>
                  <div className="scorecard-side-card scorecard-side-meta">
                    <div>
                      <span>Engine</span>
                      <strong>{result.engine.name}</strong>
                    </div>
                    <div>
                      <span>Version</span>
                      <strong className="mono">{result.engine.version}</strong>
                    </div>
                    <div>
                      <span>Generated</span>
                      <strong>{formatDateTime(result.assessmentTimestamp)}</strong>
                    </div>
                  </div>
                </div>
              </section>

              <div className="scorecard-grid">
                <section className="card factors-card">
                  <div className="card-header">
                    <div>
                      <p className="eyebrow">Explanation factors</p>
                      <h2>What shaped the illustrative score</h2>
                    </div>
                    <span className="badge badge-neutral">Out of 100 points</span>
                  </div>
                  <p className="card-lead">
                    These are the engine&apos;s return values for the selected window. They are
                    not hand-authored scorecard copy.
                  </p>

                  <div className="factor-list">
                    {result.explanationFactors.map((factor) => {
                      const percentage = Math.round((factor.points / factor.maxPoints) * 100);
                      return (
                        <div className={`factor-row factor-${factor.status}`} key={factor.id}>
                          <div className="factor-row-top">
                            <div>
                              <strong>{factor.label}</strong>
                              <span>{factor.detail}</span>
                            </div>
                            <div className="factor-points">
                              <strong>{factor.points}</strong>
                              <span>/ {factor.maxPoints}</span>
                            </div>
                          </div>
                          <div className="factor-bar-row">
                            <div
                              className={`progress-track factor-track factor-track-${factor.status}`}
                              role="progressbar"
                              aria-label={`${factor.label} score`}
                              aria-valuemin={0}
                              aria-valuemax={factor.maxPoints}
                              aria-valuenow={factor.points}
                            >
                              <span style={{ width: `${percentage}%` }} />
                            </div>
                            <span className={`factor-status factor-status-${factor.status}`}>
                              {factorStatusLabel(factor.status)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>

                <div className="scorecard-side-column">
                  <section className="card indicator-card">
                    <div className="card-header compact-header">
                      <div>
                        <p className="eyebrow">Positive indicators</p>
                        <h2>Signals supporting the result</h2>
                      </div>
                      <span className="indicator-count">
                        {result.positiveIndicators.length}
                      </span>
                    </div>
                    {result.positiveIndicators.length > 0 ? (
                      <ul className="indicator-list positive">
                        {result.positiveIndicators.map((indicator) => (
                          <li key={indicator}>
                            <span className="indicator-mark" aria-hidden="true">
                              <Check size={13} />
                            </span>
                            {indicator}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="indicator-empty">
                        No standout positive signals were returned for this window.
                      </p>
                    )}
                  </section>

                  <section className="card indicator-card">
                    <div className="card-header compact-header">
                      <div>
                        <p className="eyebrow">Areas requiring more data</p>
                        <h2>What could improve coverage</h2>
                      </div>
                      <span className="indicator-count indicator-count-warning">
                        {result.dataGaps.length}
                      </span>
                    </div>
                    {result.dataGaps.length > 0 ? (
                      <ul className="indicator-list warning">
                        {result.dataGaps.map((gap) => (
                          <li key={gap}>
                            <span className="indicator-mark" aria-hidden="true">
                              <Info size={13} />
                            </span>
                            {gap}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="indicator-empty">
                        No material data gaps were reported for this window.
                      </p>
                    )}
                  </section>
                </div>
              </div>

              <div className="scorecard-grid scorecard-grid-lower">
                <section className="card coverage-card">
                  <div className="card-header">
                    <div>
                      <p className="eyebrow">Data coverage</p>
                      <h2>How complete is the evidence?</h2>
                    </div>
                    <span className="badge badge-neutral">{result.dataCoverage.percentage}%</span>
                  </div>
                  <div className="coverage-components">
                    {result.dataCoverage.components.map((component) => (
                      <div className="coverage-component" key={component.id}>
                        <div className="coverage-component-head">
                          <span>{component.label}</span>
                          <strong>{component.percentage}%</strong>
                        </div>
                        <div
                          className="progress-track coverage-track"
                          role="progressbar"
                          aria-label={`${component.label} coverage`}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-valuenow={component.percentage}
                        >
                          <span style={{ width: `${component.percentage}%` }} />
                        </div>
                        <span className="coverage-weight">
                          {Math.round(component.weight * 100)}% weight
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="card contribution-card">
                  <div className="card-header">
                    <div>
                      <p className="eyebrow">Category contribution</p>
                      <h2>Payment history overview</h2>
                    </div>
                    <Link href="/transactions" className="text-link">
                      View history
                      <ArrowRight size={14} aria-hidden="true" />
                    </Link>
                  </div>
                  <div className="contribution-list">
                    {result.categoryContributions.map((contribution) => (
                      <div className="contribution-row" key={contribution.category}>
                        <CategoryIcon category={contribution.category} />
                        <div className="contribution-main">
                          <div className="contribution-head">
                            <span>{CATEGORY_DEFINITIONS[contribution.category].label}</span>
                            <strong>{formatCurrency(contribution.amount)}</strong>
                          </div>
                          <div className="progress-track">
                            <span style={{ width: `${contribution.sharePercentage}%` }} />
                          </div>
                          <div className="contribution-meta">
                            <span>
                              {contribution.count} payment{contribution.count === 1 ? "" : "s"}
                            </span>
                            <span>{contribution.sharePercentage}% of recorded value</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="contribution-note">
                    Category contributions describe recorded synthetic payment value. They are not
                    a separate score allocation.
                  </p>
                </section>
              </div>

              <section className="engine-note-card">
                <div className="engine-note-icon">
                  <ShieldAlert size={20} aria-hidden="true" />
                </div>
                <div>
                  <p className="eyebrow">Engine provenance</p>
                  <h2>Provisional reference engine</h2>
                  <p>{result.engine.note}</p>
                  <p className="engine-note-meta">
                    Owner: {result.engine.owner} · Version {result.engine.version} · Provisional{" "}
                    {result.engine.provisional ? "yes" : "no"}
                  </p>
                </div>
              </section>
            </>
          )}

          <section className="disclaimer-panel" role="note">
            <ShieldAlert size={20} aria-hidden="true" />
            <div>
              <h2>Important demo disclaimer</h2>
              <p>{result.disclaimer}</p>
            </div>
          </section>

          {ruleCompliant ? (
            <div className="assessment-footer-actions">
              <Link href="/transactions" className="btn btn-secondary">
                Review payment history
              </Link>
              <Link href="/payments/new/rent" className="btn btn-ghost">
                <Plus size={16} aria-hidden="true" />
                Add another payment
              </Link>
            </div>
          ) : null}
        </div>
      ) : null}

      {!loading && !result && !error ? (
        <section className="card assessment-empty">
          <span className="empty-state-icon">
            <Gauge size={26} aria-hidden="true" />
          </span>
          <h2>Your scorecard will appear here</h2>
          <p>
            Choose an assessment window, then generate the illustrative assessment. The result is
            returned live by <code>/api/assessment/generate</code> — nothing on this page is
            hardcoded.
          </p>
          <p className="assessment-empty-disclaimer">
            <AlertTriangle size={14} aria-hidden="true" />
            {DEMO_DISCLAIMER}
          </p>
        </section>
      ) : null}
    </div>
  );
}
