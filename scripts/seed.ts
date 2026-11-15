import { getDb, closeDb } from "../src/backend/db";

async function main(): Promise<void> {
  const db = await getDb();
  const users = await db.queryOne<{ count: number | bigint | string }>(
    "SELECT COUNT(*) AS count FROM users",
  );
  const transactions = await db.queryOne<{ count: number | bigint | string }>(
    "SELECT COUNT(*) AS count FROM transactions",
  );

  console.log(
    `FinCred demo database is ready: ${Number(users?.count ?? 0)} users, ${Number(
      transactions?.count ?? 0,
    )} synthetic transactions.`,
  );
  await closeDb();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
