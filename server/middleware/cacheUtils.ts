import { cacheRedis } from '../config/redisConnect.js';

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  STATIC_DATA: 24 * 60 * 60,      // 24 hours - for genres, cinemas, etc.
  MOVIES: 60 * 60,                // 1 hour - for movie listings
  SCREENINGS: 15 * 60,            // 15 minutes - for screening data
  USER_DATA: 5 * 60,              // 5 minutes - for user-specific data
  SEAT_AVAILABILITY: 2 * 60,      // 2 minutes - for seat availability
};

export async function cacheGet(key: string): Promise<any | null> {
  try {

    const data = await cacheRedis.get(key);
    if (data) {
      console.log(`Cache HIT: ${key}`);
      // Convert Buffer to string if needed
      const dataStr = typeof data === 'string' ? data : data.toString();
      return JSON.parse(dataStr);
    }
    console.log(`Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error(`Cache GET error for key ${key}:`, (error as Error).message);
    return null;
  }
}

export async function cacheSet(key: string, data: any, ttl: number = CACHE_TTL.MOVIES): Promise<boolean> {
  try {

    await cacheRedis.setEx(key, ttl, JSON.stringify(data));
    console.log(`Cache SET: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error(`Cache SET error for key ${key}:`, (error as Error).message);
    return false;
  }
}

export async function cacheDelPattern(pattern: string): Promise<number> {
  try {

    const keys = await cacheRedis.keys(pattern);
    if (keys.length > 0) {
      const deleted = await cacheRedis.del(keys);
      const deletedCount = typeof deleted === 'number' ? deleted : parseInt(deleted, 10);
      console.log(`Cache DEL PATTERN: ${pattern} (${deletedCount} keys deleted)`);
      return deletedCount;
    }
    return 0;
  } catch (error) {
    console.error(`Cache DEL PATTERN error for pattern ${pattern}:`, (error as Error).message);
    return 0;
  }
}

export const CacheInvalidation = {
  onMovieChange: async (): Promise<void> => {
    await cacheDelPattern('cache:movie:*');
  },

  onMoviesChange: async (): Promise<void> => {
    await cacheDelPattern('cache:movies:*');
    await cacheDelPattern('cache:screenings:*');
  },

  onScreeningChange: async (): Promise<void> => {
    await cacheDelPattern('cache:screening:*');
  },

  onScreeningsChange: async (): Promise<void> => {
    await cacheDelPattern('cache:screenings:*');
    await cacheDelPattern('cache:movies:upcoming:*');
  },

  onCinemaChange: async (): Promise<void> => {
    await cacheDelPattern('cache:cinemas*');
    await cacheDelPattern('cache:rooms*');
    await cacheDelPattern('cache:screenings:*');
    await cacheDelPattern('cache:movies:upcoming:*');
  },

  onUserTicketChange: async (): Promise<void> => {
    await cacheDelPattern('cache:user:*:tickets');
  },

  onStaticDataChange: async (): Promise<void> => {
    await cacheDelPattern('cache:genres*');
    await cacheDelPattern('cache:ticket_types*');
    await cacheDelPattern('cache:qualities*');
  },
};
