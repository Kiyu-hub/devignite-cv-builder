import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import * as schema from "@shared/schema";
import { Pool } from "pg";
import Database from "better-sqlite3";

// Check if using SQLite for local development
const useSqlite = process.env.DATABASE_URL?.startsWith("file:");

let db: ReturnType<typeof drizzlePg> | ReturnType<typeof drizzleSqlite>;

if (useSqlite) {
  // ✅ SQLite for local development (no external database needed!)
  console.log("🔌 Using SQLite for local development (no setup required!)");
  const dbPath = process.env.DATABASE_URL!.replace("file:", "");
  const sqlite = new Database(dbPath);
  db = drizzleSqlite(sqlite, { schema });
  console.log("✅ SQLite database ready at:", dbPath);
} else if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
} else {
  // ✅ PostgreSQL (works with Neon, Supabase, Render, etc.)
  console.log("🔌 Using PostgreSQL setup");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    // Optimizations for serverless
    max: 1, // Single connection for serverless functions
    idleTimeoutMillis: 0, // No idle timeout
    connectionTimeoutMillis: 10000, // 10 second timeout
  });
  db = drizzlePg(pool, { schema });
  console.log("✅ Database connected successfully");
}

export { db };
