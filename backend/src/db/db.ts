import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// console.log("Database URL", process.env.DATABASE_URL)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query("ALTER TABLE applicants ADD COLUMN IF NOT EXISTS has_paid_cv text DEFAULT 'false';").catch(err => {
  console.log("DB init check note:", err.message);
});

export const db = drizzle(pool, { schema });