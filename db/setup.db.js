import dotenv from 'dotenv';
import postgres from 'postgres';

dotenv.config();

let sql; // Singleton client

export function getPool() {
  if (!sql) {
    try {
      sql = postgres(process.env.DATABASE_URL, {
        ssl: { rejectUnauthorized: false }, // Required for Supabase
        max: 10, // optional: max connections
        idle_timeout: 20,
        connect_timeout: 10,
        prepare: false, // Disable prepared statements for better compatibility
      });
      console.log("PostgreSQL client initialized.");
    } catch (err) {
      console.error("Failed to initialize PostgreSQL client:", err.message);
      sql = null;
    }
  }
  return sql;
}
