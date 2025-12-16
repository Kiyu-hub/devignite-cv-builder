import "dotenv/config";
import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const useSqlite = process.env.DATABASE_URL.startsWith("file:");

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: useSqlite ? "sqlite" : "postgresql",
  dbCredentials: useSqlite 
    ? { url: process.env.DATABASE_URL.replace("file:", "") }
    : { url: process.env.DATABASE_URL },
});
