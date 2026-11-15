export type DatabaseDialect = "sqlite" | "postgres";

export interface DatabaseAdapter {
  readonly dialect: DatabaseDialect;
  query<T>(sql: string, params?: readonly unknown[]): Promise<T[]>;
  queryOne<T>(sql: string, params?: readonly unknown[]): Promise<T | null>;
  execute(sql: string, params?: readonly unknown[]): Promise<{ changes: number }>;
  exec(sql: string): Promise<void>;
  transaction<T>(work: (tx: DatabaseAdapter) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}

export function toPostgresPlaceholders(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

export function isUniqueViolation(error: unknown, constraint?: string): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String(error.code) : "";
  const message = "message" in error ? String(error.message).toLowerCase() : "";
  if (code === "23505" || code === "SQLITE_CONSTRAINT_UNIQUE") {
    if (!constraint) return true;
    return message.includes(constraint.toLowerCase());
  }
  return message.includes("unique constraint") && (!constraint || message.includes(constraint));
}
