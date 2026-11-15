import path from "node:path";

export function resolveProjectPath(value: string): string {
  return path.isAbsolute(value) ? value : path.join(process.cwd(), value);
}

export function getDbPath(): string {
  return resolveProjectPath(process.env.FINCRED_DB_PATH ?? "data/finecred.db");
}

export function getUploadRoot(): string {
  return resolveProjectPath(process.env.FINCRED_UPLOAD_DIR ?? "data/uploads");
}

export function getMaxUploadBytes(): number {
  const configured = Number(process.env.FINCRED_MAX_UPLOAD_MB ?? "5");
  const megabytes = Number.isFinite(configured) && configured > 0 ? configured : 5;
  return Math.round(megabytes * 1024 * 1024);
}

export function isProduction(): boolean {
  return process.env.FINCRED_ENV === "production" || process.env.NODE_ENV === "production";
}
