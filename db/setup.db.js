import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

let pool; // singleton Pool

export function getPool() {
  if (!pool) {
    try {
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
        max: 10,
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
