import { Pool, type PoolClient, type QueryResultRow } from "pg";
import type { DatabaseAdapter } from "./adapter";
import { toPostgresPlaceholders } from "./adapter";

interface PostgresAdapterOptions {
  connectionString: string;
  maxConnections?: number;
  ssl?: boolean;
}

export class PostgresAdapter implements DatabaseAdapter {
  readonly dialect = "postgres" as const;
  private readonly pool: Pool;
  private readonly client: PoolClient | null;

  constructor(options: PostgresAdapterOptions | { pool: Pool; client: PoolClient }) {
    if ("pool" in options) {
      this.pool = options.pool;
      this.client = options.client;
      return;
    }

    this.pool = new Pool({
      connectionString: options.connectionString,
      max: options.maxConnections ?? 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      ssl: options.ssl ? { rejectUnauthorized: true } : undefined,
    });
    this.client = null;
  }

  async query<T>(sql: string, params: readonly unknown[] = []): Promise<T[]> {
    const result = await this.runner().query<QueryResultRow>(
      toPostgresPlaceholders(sql),
      [...params],
    );
    return result.rows as T[];
  }

  async queryOne<T>(sql: string, params: readonly unknown[] = []): Promise<T | null> {
    const rows = await this.query<T>(sql, params);
    return rows[0] ?? null;
  }

  async execute(sql: string, params: readonly unknown[] = []): Promise<{ changes: number }> {
    const result = await this.runner().query(
      toPostgresPlaceholders(sql),
      [...params],
    );
    return { changes: result.rowCount ?? 0 };
  }

  async exec(sql: string): Promise<void> {
    await this.runner().query(sql);
  }

  async transaction<T>(work: (tx: DatabaseAdapter) => Promise<T>): Promise<T> {
    if (this.client) {
      return work(this);
    }

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const tx = new PostgresAdapter({ pool: this.pool, client });
      const result = await work(tx);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      client.release();
    }
  }

  async close(): Promise<void> {
    if (!this.client) {
      await this.pool.end();
    }
  }

  private runner(): Pool | PoolClient {
    return this.client ?? this.pool;
  }
}
