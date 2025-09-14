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

/**
 * Fetches a single job from cache by job ID and company ID
 * @param {number} jobId - The job ID
 * @param {number} companyId - The company ID
 * @returns {Promise<Object|null>} Job object or null if not found
 */
export const getJobFromCache = async (jobId, companyId) => {
  try {
    const key = `job_${jobId}_${companyId}`;
    const cachedJob = await client.get(key);
    
    if (cachedJob) {
      console.log(`Job ${jobId} found in cache`);
      return JSON.parse(cachedJob);
    }
    
    console.log(`Job ${jobId} not found in cache`);
    return null;
  } catch (error) {
    console.error('Error getting job from cache:', error);
    return null;
  }
};

/**
 * Removes a job from cache when it's deleted or updated
 * @param {number} jobId - The job ID
 * @param {number} companyId - The company ID
 */
export const removeJobFromCache = async (jobId, companyId) => {
  try {
    const key = `job_${jobId}_${companyId}`;
    await client.del(key);
    console.log(`Removed job ${jobId} from cache`);
  } catch (error) {
    console.error('Error removing job from cache:', error);
  }
};

/**
 * Fetches all public notices from cache, fallback to DB via fetchAndFormatAllNotices
 */
export const getAllNoticesFromCache = async () => {
  try {
    const noticeKeys = await client.keys('notice_*');
    console.log('Found notice keys:', noticeKeys.length);
    if (noticeKeys.length > 0) {
      console.log('Returning notices from Redis cache...');
      const noticeValues = await client.mGet(noticeKeys);
      const parsed = noticeValues.map(v => (v ? JSON.parse(v) : null)).filter(v => v !== null);
      // Filter out expired notices based on expiresAt if present
      const now = Date.now();
      const valid = parsed.filter(n => !n.expiresAt || new Date(n.expiresAt).getTime() > now);
      console.log(`Retrieved ${valid.length} notices from cache`);
      return valid;
    }
    console.log('Notice cache miss. Fetching from database...');
    // const { fetchAndFormatAllNotices } = await import('./notice.db.js');
    // return await fetchAndFormatAllNotices();
  } catch (error) {
    console.error('Error in getAllNoticesFromCache:', error);
    const { fetchAndFormatAllNotices } = await import('./notice.db.js');
    return await fetchAndFormatAllNotices();
  }
};

export const getNoticeFromCache = async (noticeId) => {
  try {
    const key = `notice_${noticeId}`;
    const cached = await client.get(key);
    if (cached) return JSON.parse(cached);
    return null;
  } catch (error) {
    console.error('Error getting notice from cache:', error);
    return null;
  }
};

export const removeNoticeFromCache = async (noticeId) => {
  try {
    const key = `notice_${noticeId}`;
    await client.del(key);
    console.log(`Removed notice ${noticeId} from cache`);
  } catch (error) {
    console.error('Error removing notice from cache:', error);
  }
};

// Export both the client and the connect function
export { client, connectRedis };

