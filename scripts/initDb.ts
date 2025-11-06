// scripts/initDb.ts
import { postgresStorage } from "../src/lib/postgres-storage.ts";

async function main() {
  try {
    await postgresStorage.initializeTables();
    console.log("Tables initialized!");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();

