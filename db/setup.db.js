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
        idleTimeoutMillis: parseInt(process.env.PG_IDLE_TIMEOUT_MS || '300000', 10), // 5 minutes
        connectionTimeoutMillis: parseInt(process.env.PG_CONN_TIMEOUT_MS || '10000', 10),
        keepAlive: true,
        keepAliveInitialDelayMillis: 10000, // 10 seconds
        // Add reconnection settings
        allowExitOnIdle: false,
        // Query timeout
        query_timeout: 30000, // 30 seconds
        // Connection retry settings
        application_name: 'erp-backend',
      });

      // Handle connection errors with retry logic
      pool.on('error', async (err) => {
        console.error('Unexpected PostgreSQL pool error (handled):', err);
        
        // If it's a connection termination, try to recreate the pool
        if (err.code === 'XX000' || err.message.includes('shutdown') || err.message.includes('termination')) {
          console.log('Database connection terminated, attempting to reconnect...');
          try {
            await pool.end();
            pool = null;
            // Recreate pool after a short delay
            setTimeout(() => {
              getPool();
              console.log('Database reconnection attempt completed.');
            }, 5000);
          } catch (reconnectError) {
            console.error('Failed to reconnect to database:', reconnectError);
          }
        }
      });

      // Handle client connection events
      pool.on('connect', (client) => {
        console.log('New client connected to PostgreSQL pool');
        
        // Set up client-level error handling
        client.on('error', (err) => {
          console.error('PostgreSQL client error:', err);
        });
      });

      pool.on('acquire', () => {
        console.log('Client acquired from pool');
      });

      pool.on('remove', () => {
        console.log('Client removed from pool');
      });

      console.log('PostgreSQL pool initialized.');
    } catch (err) {
      console.error('Failed to initialize PostgreSQL pool:', err.message);
      pool = null;
    }
  }
  return pool;
}

// Health check function
export async function checkDatabaseHealth() {
  try {
    const client = await pool.query('SELECT NOW()');
    console.log('Database health check passed:', client.rows[0]);
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Graceful shutdown
export async function closePool() {
  if (pool) {
    console.log('Closing PostgreSQL pool...');
    await pool.end();
    pool = null;
    console.log('PostgreSQL pool closed.');
  }
}
