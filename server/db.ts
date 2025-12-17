import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-serverless";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";
import { neon } from "@neondatabase/serverless";
import { Pool } from "pg";
import Database from "better-sqlite3";

// Check if using SQLite for local development
const useSqlite = process.env.DATABASE_URL?.startsWith("file:");

let db: ReturnType<typeof drizzlePg> | ReturnType<typeof drizzleSqlite> | ReturnType<typeof drizzleNeon>;

if (useSqlite) {
  // ✅ SQLite for local development (no external database needed!)
  console.log("🔌 Using SQLite for local development (no setup required!)");
  const dbPath = process.env.DATABASE_URL!.replace("file:", "");
  const sqlite = new Database(dbPath);
  db = drizzleSqlite(sqlite, { schema });
  console.log("✅ SQLite database ready at:", dbPath);
} else if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
} else if (process.env.DATABASE_URL.includes("neon.tech") || process.env.DATABASE_URL.includes("supabase.com")) {
  // ✅ Neon or Supabase PostgreSQL (serverless) - both use the same driver
  console.log("🔌 Using serverless PostgreSQL setup (Neon/Supabase)");
  const sql = neon(process.env.DATABASE_URL);
  db = drizzleNeon(sql, { schema });
  console.log("✅ Database connected successfully");
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
