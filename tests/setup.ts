import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll } from "vitest";

const testRoot = mkdtempSync(path.join(tmpdir(), "fincred-tests-"));

process.env.AUTH_SECRET = "fincred-test-secret-not-for-production";
process.env.FINCRED_DB_PATH = path.join(testRoot, "fincred-test.db");
process.env.FINCRED_UPLOAD_DIR = path.join(testRoot, "uploads");
process.env.FINCRED_SEED_SAMPLE = "false";
process.env.FINCRED_ENV = "test";

afterAll(async () => {
  const { closeDb } = await import("@/backend/db");
  await closeDb();
  rmSync(testRoot, { recursive: true, force: true });
});
