import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

let pool; // singleton Pool

export function getPool() {
  if (!pool) {
    try {
      const connStr = process.env.DATABASE_URL;
      // Decide SSL based on connection string (cloud DBs like Supabase/Neon always require SSL)
      const shouldUseSSL = (() => {
        const url = (connStr || '').toLowerCase();
        if (!url) return false;
        if (process.env.PGSSL === 'true') return true;
        return /supabase|neon|heroku|railway|render|vercel|amazonaws|azure|googleapis|gcp|pooler/.test(url);
      })();

      pool = new Pool({
        connectionString: connStr,
        ssl: shouldUseSSL ? { rejectUnauthorized: false } : false,
        max: parseInt(process.env.PG_POOL_MAX || '10', 10),
        idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT_MS || '30000', 10),
        connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT_MS || '10000', 10),
        keepAlive: true,
      });

      // Prevent app crash on unexpected idle client errors
      pool.on('error', (err) => {
        console.error('Unexpected PostgreSQL pool error (handled):', err);
      });
      console.log('PostgreSQL pool initialized.');
    } catch (err) {
      console.error('Failed to initialize PostgreSQL pool:', err.message);
      pool = null;
    }
  }
  return pool;
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
