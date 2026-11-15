import type { Metadata } from "next";
import {
  ArrowLeft,
  Braces,
  LockKeyhole,
  ShieldAlert,
  Terminal,
} from "lucide-react";
import Link from "next/link";
import { Logo } from "@/frontend/components/brand/Logo";
import { DEMO_ACCOUNTS } from "@/models/demo-accounts";
import { getServerSession } from "@/backend/auth/server-session";
import { openApiDocument } from "@/backend/openapi";

export const metadata: Metadata = {
  title: "API documentation",
};

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

interface Operation {
  tags?: readonly string[];
  summary?: string;
  description?: string;
}

function collectEndpoints() {
  const endpoints: Array<{
    method: string;
    path: string;
    summary: string;
    description?: string;
    tags: readonly string[];
  }> = [];

  for (const [path, pathItem] of Object.entries(openApiDocument.paths)) {
    for (const method of HTTP_METHODS) {
      const operation = (pathItem as Record<string, unknown>)[method] as Operation | undefined;
      if (!operation) continue;
      endpoints.push({
        method: method.toUpperCase(),
        path,
        summary: operation.summary ?? "Endpoint",
        description: operation.description,
        tags: operation.tags ?? [],
      });
    }
  }

  return endpoints;
}

export default async function DocsPage() {
  const session = await getServerSession();
  const endpoints = collectEndpoints();

  return (
    <main className="docs-shell">
      <header className="docs-topbar">
        <div className="docs-topbar-inner">
          <Logo />
          <div className="docs-topbar-actions">
            <Link href={session ? "/dashboard" : "/login"} className="btn btn-secondary btn-sm">
              <ArrowLeft size={15} aria-hidden="true" />
              {session ? "Back to dashboard" : "Back to login"}
            </Link>
            <a
              href="/api/openapi"
              className="btn btn-primary btn-sm"
              target="_blank"
              rel="noreferrer"
            >
              <Braces size={15} aria-hidden="true" />
              OpenAPI JSON
            </a>
          </div>
        </div>
      </header>

      <div className="docs-container">
        <section className="docs-hero">
          <p className="eyebrow">Developer reference</p>
          <h1>FinCred demo API</h1>
          <p>
            This prototype uses Next.js Route Handlers for the backend. The full OpenAPI 3.1
            document is available at <code>/api/openapi</code>. Every endpoint below returns a
            structured error envelope and never exposes stack traces, passwords, or secrets.
          </p>
          <div className="docs-callout">
            <ShieldAlert size={18} aria-hidden="true" />
            <p>
              Demo only. All records, users, attachments, and assessments are fictional. Do not
              submit real customer data or use outputs for lending decisions.
            </p>
          </div>
        </section>

        <section className="docs-section">
          <div className="docs-section-heading">
            <LockKeyhole size={18} aria-hidden="true" />
            <div>
              <h2>Authentication</h2>
              <p>Demo session cookie issued by the login endpoint.</p>
            </div>
          </div>
          <div className="docs-card">
            <p>
              <code>POST /api/auth/login</code> validates one of the fictional accounts, hashes
              passwords with scrypt, and sets an HTTP-only <code>fincred_session</code> cookie
              signed with HS256. Protected endpoints require that cookie. The cookie expires after
              8 hours.
            </p>
            <div className="docs-credential-grid">
              {DEMO_ACCOUNTS.map((account) => (
                <div className="docs-credential" key={account.email}>
                  <span>{account.label}</span>
                  <code>{account.email}</code>
                  <code>{account.password}</code>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="docs-section">
          <div className="docs-section-heading">
            <Terminal size={18} aria-hidden="true" />
            <div>
              <h2>Endpoints</h2>
              <p>{endpoints.length} documented route handlers.</p>
            </div>
          </div>

          <div className="endpoint-list">
            {endpoints.map((endpoint) => (
              <article className="endpoint-card" key={`${endpoint.method}-${endpoint.path}`}>
                <div className="endpoint-line">
                  <span className={`method method-${endpoint.method.toLowerCase()}`}>
                    {endpoint.method}
                  </span>
                  <code className="endpoint-path">{endpoint.path}</code>
                </div>
                <p className="endpoint-summary">{endpoint.summary}</p>
                {endpoint.description ? (
                  <p className="endpoint-description">{endpoint.description}</p>
                ) : null}
                <div className="endpoint-tags">
                  {endpoint.tags.map((tag) => (
                    <span key={tag} className="badge badge-neutral">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="docs-section">
          <div className="docs-section-heading">
            <Braces size={18} aria-hidden="true" />
            <div>
              <h2>Error envelope</h2>
              <p>Consistent structured errors across the demo backend.</p>
            </div>
          </div>
          <pre className="docs-code">
{`{
  "error": {
    "code": "validation_error",
    "message": "Please correct the highlighted payment details.",
    "fields": {
      "amount": "Payment amount must be greater than zero."
    }
  }
}`}
          </pre>
          <div className="docs-note-grid">
            <div className="docs-note">
              <strong>401</strong>
              <span>Missing or expired demo session.</span>
            </div>
            <div className="docs-note">
              <strong>409</strong>
              <span>Duplicate synthetic transaction.</span>
            </div>
            <div className="docs-note">
              <strong>422</strong>
              <span>Validation or attachment error.</span>
            </div>
            <div className="docs-note">
              <strong>503</strong>
              <span>Assessment engine unavailable.</span>
            </div>
          </div>
        </section>

        <section className="docs-section">
          <div className="docs-section-heading">
            <ShieldAlert size={18} aria-hidden="true" />
            <div>
              <h2>Security and demo limits</h2>
              <p>This API is intentionally scoped to an internal prototype.</p>
            </div>
          </div>
          <ul className="docs-limits">
            <li>No customer onboarding, banking APIs, payment gateways, or lending decisions.</li>
            <li>Only synthetic PDF, JPG, JPEG, and PNG files up to 5 MB are accepted.</li>
            <li>Attachments are stored outside the public folder and served only to the owner.</li>
            <li>The assessment engine returns a provisional reference result until Devansh&apos;s agreed methodology is integrated.</li>
            <li>All illustrative assessment responses include the mandatory demo disclaimer.</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
