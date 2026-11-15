# FinCred

Finance Credibility is an illustrative full-stack prototype that turns synthetic payment records into a transparent reference assessment. It includes public marketing pages, role-aware consumer, lender, and administrator workspaces, light and dark themes, and responsive layouts. It is not a credit score, lending decision, or validated financial assessment.

## Run locally

```bash
npm install
npm run dev
```

`npm run dev` starts the Next.js app, which serves the frontend pages and backend API routes together on `http://localhost:3000`.

Useful commands:

```bash
npm run typecheck
npm test
npm run build
npm run db:seed
npm run db:reset
```

## Demo accounts

| Role | Email | Password | Workspace |
| --- | --- | --- | --- |
| Consumer | `consumer@fincred.demo` | `Demo@123` | Payments, score, analytics, insights, reports, consent |
| Lender | `lender@fincred.demo` | `Demo@123` | Applicants, assessments, portfolio reports, API docs |
| Administrator | `admin@fincred.demo` | `Demo@123` | Users, lenders, payments, scoring, synthetic data, audit logs |

These credentials are fictional and demo-only. Never enter real customer or financial information.

## Architecture

The project is one Next.js application with separate source layers:

```text
src/
  app/                  Next.js route entrypoints only
    (app)/              Authenticated page routes
    api/                Thin API route adapters
    login/              Login page route
    docs/               API documentation page
  frontend/             Browser-facing application layer
    components/         Reusable UI and screen components
    providers/          Auth and toast providers
    lib/                Client API and formatting helpers
    styles/             Global design system
  backend/              Server-only application layer
    auth/               Passwords, sessions, cookies
    config/             Runtime paths and environment config
    db/                 SQLite/PostgreSQL adapters, migrations, repositories
    transactions/       Transaction services, serializers, summaries
    assessment/         Engine contract, service, reference implementation
    http/               Controllers and structured API errors
    files.ts            Synthetic attachment storage and validation
    openapi.ts          OpenAPI contract
  models/               Shared contracts and domain models
    api.ts              API DTOs
    auth.ts             Session model
    db.ts               Database record models
    domain.ts           Domain constants and types
    demo-accounts.ts    Demo account fixtures
    validation/         Shared Zod request and form schemas
```

Dependency direction:

```text
app -> frontend / backend / models
frontend -> models + frontend/lib
backend -> models
models -> models only
```

`src/app/api/*/route.ts` files only adapt Next.js routing to backend controllers. All business logic lives under `src/backend`. Frontend components never import backend modules.

## Backend behavior

- SQLite for local use through Node's built-in `node:sqlite`; PostgreSQL for production/Azure through `pg`.
- Argon2id password hashing with transparent rehashing of legacy scrypt hashes at login.
- Short-lived signed `fincred_session` access cookies plus rotating, hashed refresh tokens with reuse detection and family revocation.
- Session-version checks invalidate existing access tokens when an administrator changes a role or disables an account.
- Persisted consent, lender note, report, synthetic-data job, audit, organization, and refresh-token records.
- Immutable reports and append-only audit logs enforced by database triggers.
- Zod validation shared between browser forms and API handlers.
- Duplicate payment detection with a per-user fingerprint.
- Synthetic attachments restricted to PDF/JPG/JPEG/PNG, up to 5 MB, validated by MIME type and magic bytes.
- Attachments are stored outside `public/` and served only to their owner.
- Structured API errors with no stack traces or secrets in responses.
- Assessment requires at least 3 payments across 2 categories; otherwise it returns `insufficient_data` without inventing a score.

## Assessment integration

The provisional engine is `ReferenceAssessmentEngine` in `src/backend/assessment/reference-engine.ts`. Replace it through:

```ts
import { registerAssessmentEngine } from "@/backend/assessment";
```

The active engine reports `provisional: true` and identifies Devansh's agreed methodology as pending integration.

## Documentation

- Human-readable API docs: `/docs`
- OpenAPI 3.1 JSON: `/api/openapi`
- Health check: `/api/health`

## Environment

Copy `.env.example` to `.env.local` if you need to override defaults. Important variables:

- `AUTH_SECRET`
- `FINCRED_DB_DRIVER` (`sqlite` or `postgres`)
- `DATABASE_URL`
- `FINCRED_PG_POOL_MAX`
- `FINCRED_PG_SSL`
- `FINCRED_DB_PATH`
- `FINCRED_UPLOAD_DIR`
- `FINCRED_MAX_UPLOAD_MB`
- `FINCRED_SEED_DEMO`
- `FINCRED_SEED_SAMPLE`
- `FINCRED_ALLOW_SQLITE_PRODUCTION`

## Production PostgreSQL / Azure

Production requires PostgreSQL unless `FINCRED_ALLOW_SQLITE_PRODUCTION=true` is set explicitly. The app runs schema migrations and installs immutability triggers on first database access.

```bash
FINCRED_ENV=production
FINCRED_DB_DRIVER=postgres
DATABASE_URL=postgresql://user:password@server.postgres.database.azure.com:5432/fincred?sslmode=require
AUTH_SECRET=<long-random-secret>
```

Use Azure Database for PostgreSQL with TLS enabled. Demo seeding defaults to off when `NODE_ENV=production` or `FINCRED_ENV=production`; set `FINCRED_SEED_DEMO=true` only for an intentional demo deployment. Database migrations are additive and tracked in `schema_migrations`; there is no destructive automatic rollback.

## Production API surface

- `POST /api/auth/refresh` rotates the refresh token and issues a new access token.
- `GET|POST /api/consents`, `GET|PATCH /api/consents/:id` manage consumer consent.
- `GET /api/lender/applicants`, applicant detail, notes, consents, and reports are scoped by active consent.
- `GET|POST /api/reports`, `GET /api/reports/:id` create and read immutable reports.
- Lender applicant and report access is scoped to active consent; withdrawing consent revokes lender access while the consumer retains their own report history.
- Disabling or demoting an account invalidates its refresh tokens and session version.
- `GET|POST /api/synthetic-data` generates and lists fictional payment jobs.
- `GET /api/admin/overview`, users, payments, consents, reports, audit logs, and organizations require an administrator.

## Notes

- The development and build scripts use Webpack because the Turbopack native SWC binding is unavailable in the current Windows environment.
- The test suite uses a temporary SQLite database and temporary upload directory.
