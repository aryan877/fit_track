import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./db";

async function runMigrations() {
  try {
    // This will run migrations on the database, skipping the ones already applied
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
  } finally {
    // Don't forget to close the connection, otherwise the script will hang
    await pool.end();
  }
}

runMigrations();
