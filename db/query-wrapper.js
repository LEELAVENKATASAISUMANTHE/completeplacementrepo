/**
 * Database Query Wrapper
 * Provides resilient database query execution with retry logic
 */
import { getPool } from './setup.db.js';

/**
 * Execute a database query with retry logic
 * @param {string} query - SQL query string
 * @param {Array} params - Query parameters
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<Object>} Query result
 */
export async function executeQuery(query, params = [], maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const pool = getPool();
      if (!pool) {
        throw new Error('Database pool not available');
      }
      
      const result = await pool.query(query, params);
      
      // If successful, return result
      if (attempt > 1) {
        console.log(`✅ Query succeeded on attempt ${attempt}`);
      }
      
      return result;
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Query attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      // Check if it's a connection-related error
      const isConnectionError = (
        error.code === 'XX000' ||
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.message.includes('shutdown') ||
        error.message.includes('termination') ||
        error.message.includes('connection')
      );
      
      // If it's the last attempt or not a connection error, throw
      if (attempt === maxRetries || !isConnectionError) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`⏳ Retrying query in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Force pool recreation for connection errors
      if (isConnectionError) {
        try {
          const pool = getPool();
          await pool.end();
          // Pool will be recreated on next getPool() call
        } catch (poolError) {
          console.error('Error closing pool for reconnection:', poolError.message);
        }
      }
    }
  }
  
  // If we get here, all attempts failed
  console.error(`💥 All ${maxRetries} query attempts failed`);
  throw lastError;
}

/**
 * Execute a transaction with retry logic
 * @param {Function} transactionCallback - Function containing transaction logic
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise<any>} Transaction result
 */
export async function executeTransaction(transactionCallback, maxRetries = 3) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const client = await getPool().connect();
    
    try {
      await client.query('BEGIN');
      const result = await transactionCallback(client);
      await client.query('COMMIT');
      
      if (attempt > 1) {
        console.log(`✅ Transaction succeeded on attempt ${attempt}`);
      }
      
      return result;
      
    } catch (error) {
      lastError = error;
      console.error(`❌ Transaction attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      try {
        await client.query('ROLLBACK');
      } catch (rollbackError) {
        console.error('Error during rollback:', rollbackError.message);
      }
      
      // Check if it's a connection-related error
      const isConnectionError = (
        error.code === 'XX000' ||
        error.code === 'ECONNRESET' ||
        error.code === 'ENOTFOUND' ||
        error.code === 'ETIMEDOUT' ||
        error.message.includes('shutdown') ||
        error.message.includes('termination') ||
        error.message.includes('connection')
      );
      
      // If it's the last attempt or not a connection error, break
      if (attempt === maxRetries || !isConnectionError) {
        break;
      }
      
      // Wait before retrying
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      console.log(`⏳ Retrying transaction in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
    } finally {
      client.release();
    }
  }
  
  // If we get here, all attempts failed
  console.error(`💥 All ${maxRetries} transaction attempts failed`);
  throw lastError;
}

/**
 * Health check with detailed connection info
 * @returns {Promise<Object>} Health status object
 */
export async function getDetailedHealthStatus() {
  try {
    const pool = getPool();
    const start = Date.now();
    
    const result = await executeQuery('SELECT NOW() as current_time, version() as version');
    const responseTime = Date.now() - start;
    
    return {
      status: 'healthy',
      responseTime: `${responseTime}ms`,
      currentTime: result.rows[0].current_time,
      version: result.rows[0].version,
      poolInfo: {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
      }
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      code: error.code
    };
  }
}