import { mkdirSync } from "node:fs";
import path from "node:path";
import { getDbPath, isProduction } from "@/backend/config/paths";
import type { DatabaseAdapter, DatabaseDialect } from "./adapter";
import { dropImmutabilityTriggers, runMigrations } from "./schema";
import { ensureSeedData } from "./seed";
import { PostgresAdapter } from "./postgres-adapter";
import { SqliteAdapter } from "./sqlite-adapter";

let connection: DatabaseAdapter | null = null;
let connectionKey: string | null = null;
let opening: Promise<DatabaseAdapter> | null = null;

export function getDatabaseDialect(): DatabaseDialect {
  const configured = process.env.FINCRED_DB_DRIVER?.trim().toLowerCase();
  if (configured === "sqlite" || configured === "postgres") return configured;
  return process.env.DATABASE_URL?.startsWith("postgres") ? "postgres" : "sqlite";
}

function adapterKey(dialect: DatabaseDialect): string {
  return dialect === "postgres"
    ? `postgres:${process.env.DATABASE_URL ?? ""}`
    : `sqlite:${getDbPath()}`;
}

function createAdapter(dialect: DatabaseDialect): DatabaseAdapter {
  if (dialect === "postgres") {
    const connectionString = process.env.DATABASE_URL?.trim();
    if (!connectionString) {
      throw new Error("DATABASE_URL is required when FINCRED_DB_DRIVER=postgres.");
    }
    const configuredMax = Number(process.env.FINCRED_PG_POOL_MAX ?? "10");
    const useSsl =
      process.env.FINCRED_PG_SSL === "true" ||
      process.env.FINCRED_PG_SSL === "verify-full" ||
      connectionString.includes("sslmode=require");
    return new PostgresAdapter({
      connectionString,
      maxConnections: Number.isFinite(configuredMax) ? configuredMax : 10,
      ssl: useSsl,
    });
  }

  if (isProduction() && process.env.FINCRED_ALLOW_SQLITE_PRODUCTION !== "true") {
    throw new Error(
      "Production requires PostgreSQL. Set DATABASE_URL and FINCRED_DB_DRIVER=postgres, or explicitly set FINCRED_ALLOW_SQLITE_PRODUCTION=true.",
    );
  }

  const dbPath = getDbPath();
  if (dbPath !== ":memory:") {
    mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  return new SqliteAdapter(dbPath);
}

function shouldSeedDemo(): boolean {
  const configured = process.env.FINCRED_SEED_DEMO?.trim().toLowerCase();
  if (configured === "true") return true;
  if (configured === "false") return false;
  return !isProduction();
}

async function openDatabase(dialect: DatabaseDialect): Promise<DatabaseAdapter> {
  const adapter = createAdapter(dialect);
  try {
    await runMigrations(adapter);
    if (shouldSeedDemo()) {
      await ensureSeedData(adapter);
    }
    return adapter;
  } catch (error) {
    await adapter.close().catch(() => undefined);
    throw error;
  }
}

export async function getDb(): Promise<DatabaseAdapter> {
  const dialect = getDatabaseDialect();
  const key = adapterKey(dialect);
  if (connection && connectionKey === key) {
    return connection;
  }
  if (opening) {
    return opening;
  }

  opening = (async () => {
    if (connection) {
      await connection.close().catch(() => undefined);
      connection = null;
      connectionKey = null;
    }
    const adapter = await openDatabase(dialect);
    connection = adapter;
    connectionKey = key;
    return adapter;
  })();

  try {
    return await opening;
  } finally {
    opening = null;
  }
}

export async function closeDb(): Promise<void> {
  if (opening) {
    await opening.catch(() => undefined);
  }
  if (connection) {
    await connection.close().catch(() => undefined);
    connection = null;
    connectionKey = null;
  }
}

export async function resetDatabase(): Promise<{ users: number; transactions: number }> {
  if (isProduction()) {
    throw new Error("Database reset is disabled in production.");
  }

  const db = await getDb();
  await dropImmutabilityTriggers(db);
  await db.transaction(async (tx) => {
    for (const table of [
      "audit_logs",
      "reports",
      "synthetic_jobs",
      "lender_notes",
      "organization_members",
      "lender_organizations",
      "consents",
      "refresh_tokens",
      "transactions",
      "users",
    ]) {
      await tx.exec(`DELETE FROM ${table}`);
    }
  });
  await runMigrations(db);
  await ensureSeedData(db);

  const userCount = await db.queryOne<{ count: number | bigint | string }>(
    "SELECT COUNT(*) AS count FROM users",
  );
  const transactionCount = await db.queryOne<{ count: number | bigint | string }>(
    "SELECT COUNT(*) AS count FROM transactions",
  );

  return {
    users: Number(userCount?.count ?? 0),
    transactions: Number(transactionCount?.count ?? 0),
  };
}
