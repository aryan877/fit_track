import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./db";

async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
  } finally {
    await pool.end();
  }
}

runMigrations();
