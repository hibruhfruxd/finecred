import { DatabaseSync } from "node:sqlite";
import type { DatabaseAdapter } from "./adapter";

type SqliteParam = null | number | bigint | string | Uint8Array;

function params(values: readonly unknown[] = []): SqliteParam[] {
  return values as SqliteParam[];
}

export class SqliteAdapter implements DatabaseAdapter {
  readonly dialect = "sqlite" as const;
  private readonly db: DatabaseSync;
  private transactionDepth = 0;

  constructor(dbPath: string) {
    this.db = new DatabaseSync(dbPath);
    this.db.exec("PRAGMA foreign_keys = ON;");
    this.db.exec("PRAGMA busy_timeout = 5000;");
    if (dbPath !== ":memory:") {
      this.db.exec("PRAGMA journal_mode = WAL;");
    }
  }

  async query<T>(sql: string, values: readonly unknown[] = []): Promise<T[]> {
    return this.db.prepare(sql).all(...params(values)) as T[];
  }

  async queryOne<T>(sql: string, values: readonly unknown[] = []): Promise<T | null> {
    const row = this.db.prepare(sql).get(...params(values));
    return (row as T | undefined) ?? null;
  }

  async execute(sql: string, values: readonly unknown[] = []): Promise<{ changes: number }> {
    const result = this.db.prepare(sql).run(...params(values));
    return { changes: Number(result.changes) };
  }

  async exec(sql: string): Promise<void> {
    this.db.exec(sql);
  }

  async transaction<T>(work: (tx: DatabaseAdapter) => Promise<T>): Promise<T> {
    if (this.transactionDepth > 0) {
      return work(this);
    }

    this.transactionDepth += 1;
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const result = await work(this);
      this.db.exec("COMMIT");
      return result;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    } finally {
      this.transactionDepth -= 1;
    }
  }

  async close(): Promise<void> {
    this.db.close();
  }
}
