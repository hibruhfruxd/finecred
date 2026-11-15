import { rmSync } from "node:fs";
import { closeDb, resetDatabase } from "../src/backend/db";
import { getUploadRoot } from "../src/backend/config/paths";

async function main(): Promise<void> {
  rmSync(getUploadRoot(), { recursive: true, force: true });
  const counts = await resetDatabase();
  console.log(
    `FinCred database reset: ${counts.users} demo users and ${counts.transactions} sample transactions.`,
  );
  await closeDb();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
