import { asyncHandler } from '../utils/AsyncHandler.js'; // Assuming you have this utility
import { fetchAndFormatAllJobs } from '../db/job.db.js';
import client from '../db/redis.db.js'; // Your Redis client
import * as lux from 'luxon';

const cacheJobs = asyncHandler(async () => {
    try {
        console.log("Starting job caching process...");
        const jobs = await fetchAndFormatAllJobs();

        // 1. Start a new pipeline (multi)
        const multi = client.multi();

        let cachedCount = 0;
        for (const job of jobs) {
            const key = `${job.id}_${job.company.id}`;
            const dualation = job.end_date ? lux.DateTime.fromISO(job.end_date).diffNow("seconds").seconds : 86400; // Default to 24 hours

            if (dualation > 0) {
                // 2. Instead of sending the command, add it to the pipeline
                multi.setEx(key, Math.floor(dualation), JSON.stringify(job));
                cachedCount++;
            } else {
                console.log(`Skipping job with key: ${key} as it has already expired.`);
            }
        }
        
        // 3. Execute all commands in the pipeline at once
        if (cachedCount > 0) {
            console.log(`Executing pipeline with ${cachedCount} job(s)...`);
            await multi.exec();
            console.log("✅ Successfully cached all jobs.");
        } else {
            console.log("No active jobs to cache.");
        }

    } catch (error) {
        console.error("Error caching jobs:", error);
    }
});

export default cacheJobs;