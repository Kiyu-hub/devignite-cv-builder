import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import Database from "better-sqlite3";

// Check if using SQLite for local development
const useSqlite = process.env.DATABASE_URL?.startsWith("file:");

let db;

if (useSqlite) {
  // ✅ SQLite for local development (no external database needed!)
  console.log("🔌 Using SQLite for local development (no setup required!)");
  const dbPath = process.env.DATABASE_URL!.replace("file:", "");
  const sqlite = new Database(dbPath);
  db = drizzleSqlite(sqlite, { schema });
  console.log("✅ SQLite database ready at:", dbPath);
} else if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
} else if (process.env.DATABASE_URL.includes("neon.tech")) {
  // ✅ Neon PostgreSQL (serverless)
  console.log("🔌 Using Neon PostgreSQL setup");
  const sql = neon(process.env.DATABASE_URL);
  db = drizzlePg(sql, { schema });
} else {
  // ✅ Render or standard PostgreSQL
  console.log("🔌 Using standard PostgreSQL setup (Render or local)");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  db = drizzlePg(pool, { schema });
}

export { db };
