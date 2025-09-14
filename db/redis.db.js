import { createClient } from 'redis';

// Initialize the client with your provided credentials
const client = createClient({
    username: 'default',
    password: 'nLJ2jKsCFeZg4I5d1oXSJXROna5vKo4d',
    socket: {
        host: 'redis-13247.c251.east-us-mz.azure.redns.redis-cloud.com',
        port: 13247
    }
});

// Handle connection errors
client.on('error', err => console.log('Redis Client Error', err));

// Asynchronously connect to the Redis server
// This function will be called once when the application starts.
async function connectRedis() {
    if (!client.isOpen) {
        await client.connect();
    }
}

/**
 * Fetches all jobs from cache, or from database if not cached
 * @returns {Promise<Array>} Array of formatted job objects
 */
export const getAllJobsFromCache = async () => {
  try {
    // Get all keys matching the job pattern
    const jobKeys = await client.keys('job_*');
    console.log('Found job keys:', jobKeys.length);
    
    if (jobKeys.length > 0) {
      console.log('Returning jobs from Redis cache...');
      // Get all job values using mget
      const jobValues = await client.mGet(jobKeys);
      
      // Parse and filter out any null values
      const jobs = jobValues
        .filter(value => value !== null)
        .map(value => JSON.parse(value));
      
      console.log(`Retrieved ${jobs.length} jobs from cache`);
      return jobs;
    }
    
    console.log('Cache miss. Fetching jobs from database...');
    // Import here to avoid circular dependency
    const { fetchAndFormatAllJobs } = await import('./job.db.js');
    const jobs = await fetchAndFormatAllJobs();
    
    // Note: Individual jobs will be cached by cacheplo.js, not here
    // This maintains your existing caching strategy
    
    return jobs;
  } catch (error) {
    console.error('Error in getAllJobsFromCache:', error);
    // If Redis fails, fallback to database
    const { fetchAndFormatAllJobs } = await import('./job.db.js');
    return await fetchAndFormatAllJobs();
  }
};

