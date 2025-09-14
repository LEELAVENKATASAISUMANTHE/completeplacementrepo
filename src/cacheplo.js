import { asyncHandler } from '../utils/AsyncHandler.js'; // Assuming you have this utility
import { fetchAndFormatAllJobs } from '../db/job.db.js';
import { client } from '../db/redis.db.js'; // Your Redis client
import * as lux from 'luxon';
import { DateTime } from 'luxon';

const cacheJobs = asyncHandler(async () => {
    try {
        console.log("Starting job caching process...");
        const jobs = await fetchAndFormatAllJobs();

        // 1. Start a new pipeline (multi)
        const multi = client.multi();

        let cachedCount = 0;
        for (const job of jobs) {
            //console.log(job);
            const key = `job_${job.id}_${job.company.id}`;
            const jobStartDate = new Date(job.endDate);
            const sec = DateTime.fromJSDate(jobStartDate).toSeconds();
            const dualation = Math.floor(sec - DateTime.now().toSeconds());
            if(dualation > 0) {
                // 2. Instead of sending the command, add it to the pipeline
                multi.setEx(key, dualation, JSON.stringify(job));
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