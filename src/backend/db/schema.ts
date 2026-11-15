import type { DatabaseAdapter } from "./adapter";

interface Migration {
  version: number;
  name: string;
  up: string;
}

const migrations: Migration[] = [
  {
    version: 1,
    name: "initial_demo_schema",
    up: `
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'consumer',
        created_at TEXT NOT NULL
      );

      CREATE TABLE transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        category TEXT NOT NULL CHECK (category IN ('rent', 'electricity', 'mobile')),
        amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
        transaction_date TEXT NOT NULL,
        platform TEXT NOT NULL,
        description TEXT NOT NULL,
        metadata_json TEXT NOT NULL DEFAULT '{}',
        attachment_filename TEXT,
        attachment_stored_name TEXT,
        attachment_mime TEXT,
        attachment_size INTEGER,
        fingerprint TEXT NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE (user_id, fingerprint)
      );

      CREATE INDEX idx_transactions_user_date
        ON transactions(user_id, transaction_date DESC, created_at DESC);

      CREATE INDEX idx_transactions_user_category
        ON transactions(user_id, category);
    `,
  },
  {
    version: 2,
    name: "production_security_and_persistence",
    up: `
      CREATE TABLE refresh_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        token_hash TEXT NOT NULL UNIQUE,
        family_id TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        revoked_at TEXT,
        replaced_by TEXT,
        user_agent TEXT,
        ip_hash TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
      CREATE INDEX idx_refresh_tokens_family ON refresh_tokens(family_id);
      CREATE INDEX idx_refresh_tokens_expiry ON refresh_tokens(expires_at);

      CREATE TABLE consents (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        lender_id TEXT,
        purpose TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        scope_json TEXT NOT NULL DEFAULT '[]',
        status TEXT NOT NULL CHECK (status IN ('granted', 'withdrawn', 'expired')),
        granted_at TEXT NOT NULL,
        expires_at TEXT,
        withdrawn_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_consents_user_status ON consents(user_id, status);
      CREATE INDEX idx_consents_lender_status ON consents(lender_id, status);
      CREATE INDEX idx_consents_expiry ON consents(expires_at);

      CREATE TABLE lender_organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE organization_members (
        organization_id TEXT NOT NULL,
        user_id TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'reviewer' CHECK (role IN ('owner', 'reviewer', 'viewer')),
        created_at TEXT NOT NULL,
        PRIMARY KEY (organization_id, user_id),
        FOREIGN KEY (organization_id) REFERENCES lender_organizations(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_organization_members_user ON organization_members(user_id);

      CREATE TABLE lender_notes (
        id TEXT PRIMARY KEY,
        lender_id TEXT NOT NULL,
        applicant_id TEXT NOT NULL,
        organization_id TEXT,
        body TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (applicant_id) REFERENCES users(id) ON DELETE RESTRICT
      );

      CREATE INDEX idx_lender_notes_applicant ON lender_notes(applicant_id, created_at DESC);
      CREATE INDEX idx_lender_notes_lender ON lender_notes(lender_id, created_at DESC);

      CREATE TABLE reports (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        requested_by TEXT NOT NULL,
        report_type TEXT NOT NULL DEFAULT 'assessment',
        status TEXT NOT NULL CHECK (status IN ('completed', 'insufficient_data')),
        score INTEGER,
        band TEXT NOT NULL DEFAULT 'Unavailable',
        report_version TEXT NOT NULL,
        assessment_json TEXT NOT NULL,
        content_sha256 TEXT NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
      );

      CREATE INDEX idx_reports_user_created ON reports(user_id, created_at DESC);
      CREATE INDEX idx_reports_requested_by ON reports(requested_by, created_at DESC);

      CREATE TABLE synthetic_jobs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        requested_by TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'completed', 'failed')),
        categories_json TEXT NOT NULL DEFAULT '[]',
        record_count INTEGER NOT NULL DEFAULT 0,
        lookback_months INTEGER NOT NULL DEFAULT 6,
        result_json TEXT NOT NULL DEFAULT '{}',
        error_message TEXT,
        created_at TEXT NOT NULL,
        completed_at TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_synthetic_jobs_user ON synthetic_jobs(user_id, created_at DESC);
      CREATE INDEX idx_synthetic_jobs_status ON synthetic_jobs(status, created_at);

      CREATE TABLE audit_logs (
        id TEXT PRIMARY KEY,
        actor_id TEXT,
        actor_role TEXT,
        action TEXT NOT NULL,
        target_type TEXT NOT NULL DEFAULT '',
        target_id TEXT,
        request_id TEXT,
        metadata_json TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL
      );

      CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
      CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id, created_at DESC);
      CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);
    `,
  },
  {
    version: 3,
    name: "user_account_status",
    up: `
      ALTER TABLE users ADD COLUMN status TEXT NOT NULL DEFAULT 'active';
      ALTER TABLE users ADD COLUMN disabled_at TEXT;
      CREATE INDEX idx_users_status ON users(status);
    `,
  },
  {
    version: 4,
    name: "auth_version",
    up: `
      ALTER TABLE users ADD COLUMN auth_version INTEGER NOT NULL DEFAULT 0;
    `,
  },
];

export async function runMigrations(adapter: DatabaseAdapter): Promise<void> {
  await adapter.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const appliedRows = await adapter.query<{ version: number | bigint | string }>(
    "SELECT version FROM schema_migrations",
  );
  const applied = new Set(appliedRows.map((row) => Number(row.version)));

  for (const migration of migrations) {
    if (applied.has(migration.version)) continue;
    await adapter.transaction(async (tx) => {
      await tx.exec(migration.up);
      await tx.execute(
        "INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)",
        [migration.version, migration.name, new Date().toISOString()],
      );
    });
  }

  await installImmutabilityTriggers(adapter);
}

export async function installImmutabilityTriggers(adapter: DatabaseAdapter): Promise<void> {
  if (adapter.dialect === "postgres") {
    await adapter.exec(`
      CREATE OR REPLACE FUNCTION fincred_reject_mutation()
      RETURNS trigger AS $$
      BEGIN
        RAISE EXCEPTION 'immutable record: % cannot be modified or deleted', TG_TABLE_NAME;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS reports_immutable_update ON reports;
      CREATE TRIGGER reports_immutable_update
        BEFORE UPDATE ON reports
        FOR EACH ROW EXECUTE FUNCTION fincred_reject_mutation();

      DROP TRIGGER IF EXISTS reports_immutable_delete ON reports;
      CREATE TRIGGER reports_immutable_delete
        BEFORE DELETE ON reports
        FOR EACH ROW EXECUTE FUNCTION fincred_reject_mutation();

      DROP TRIGGER IF EXISTS audit_logs_immutable_update ON audit_logs;
      CREATE TRIGGER audit_logs_immutable_update
        BEFORE UPDATE ON audit_logs
        FOR EACH ROW EXECUTE FUNCTION fincred_reject_mutation();

      DROP TRIGGER IF EXISTS audit_logs_immutable_delete ON audit_logs;
      CREATE TRIGGER audit_logs_immutable_delete
        BEFORE DELETE ON audit_logs
        FOR EACH ROW EXECUTE FUNCTION fincred_reject_mutation();
    `);
    return;
  }

  await adapter.exec(`
    DROP TRIGGER IF EXISTS reports_immutable_update;
    CREATE TRIGGER reports_immutable_update
      BEFORE UPDATE ON reports
      BEGIN
        SELECT RAISE(ABORT, 'reports are immutable');
      END;

    DROP TRIGGER IF EXISTS reports_immutable_delete;
    CREATE TRIGGER reports_immutable_delete
      BEFORE DELETE ON reports
      BEGIN
        SELECT RAISE(ABORT, 'reports are immutable');
      END;

    DROP TRIGGER IF EXISTS audit_logs_immutable_update;
    CREATE TRIGGER audit_logs_immutable_update
      BEFORE UPDATE ON audit_logs
      BEGIN
        SELECT RAISE(ABORT, 'audit logs are append-only');
      END;

    DROP TRIGGER IF EXISTS audit_logs_immutable_delete;
    CREATE TRIGGER audit_logs_immutable_delete
      BEFORE DELETE ON audit_logs
      BEGIN
        SELECT RAISE(ABORT, 'audit logs are append-only');
      END;
  `);
}

export async function dropImmutabilityTriggers(adapter: DatabaseAdapter): Promise<void> {
  if (adapter.dialect === "postgres") {
    await adapter.exec(`
      DROP TRIGGER IF EXISTS reports_immutable_update ON reports;
      DROP TRIGGER IF EXISTS reports_immutable_delete ON reports;
      DROP TRIGGER IF EXISTS audit_logs_immutable_update ON audit_logs;
      DROP TRIGGER IF EXISTS audit_logs_immutable_delete ON audit_logs;
    `);
    return;
  }

  await adapter.exec(`
    DROP TRIGGER IF EXISTS reports_immutable_update;
    DROP TRIGGER IF EXISTS reports_immutable_delete;
    DROP TRIGGER IF EXISTS audit_logs_immutable_update;
    DROP TRIGGER IF EXISTS audit_logs_immutable_delete;
  `);
}
