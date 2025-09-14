import { fetchAndFormatAllNotices } from "../db/notice.db.js";
import { client } from "../db/redis.db.js"; // Your Redis client
import { asyncHandler } from "../utils/AsyncHandler.js"; // Assuming you have this utility

export const cacheNotices = asyncHandler(async () => {
  try {
    console.log("Starting notice caching process...");
    const notices = await fetchAndFormatAllNotices();
    const multi = client.multi();
    for (const notice of notices) {
      const key = `notice_${notice.id}`;
      
      // Handle expires_at - it could be null, undefined, or a string/Date
      if (notice.expiresAt) {
        // Ensure we have a Date object
        const expirationDate = new Date(notice.expiresAt);
        
        // Check if the date is valid
        if (isNaN(expirationDate.getTime())) {
          console.warn(`Invalid expiration date for notice ${notice.id}, caching without TTL`);
          multi.set(key, JSON.stringify(notice));
          continue;
        }
        
        // Calculate TTL in seconds and ensure it's a positive integer
        const ttlSeconds = Math.floor((expirationDate.getTime() - Date.now()) / 1000);
        
        if (ttlSeconds <= 0) {
          console.log(`Notice ${notice.id} is expired, skipping cache`);
          continue; // Skip expired notices
        }
        
        multi.setEx(key, ttlSeconds, JSON.stringify(notice));
      } else {
        // No expiration date, cache without TTL
        multi.set(key, JSON.stringify(notice));
      }
    }
    await multi.exec();
    console.log("Notice caching process completed.");
  } catch (error) {
    console.error("Error caching notices:", error);
  }
});
