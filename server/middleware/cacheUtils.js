import { getCacheRedis } from '../config/redisConnect.js';

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  STATIC_DATA: 24 * 60 * 60,      // 24 hours - for genres, cinemas, etc.
  MOVIES: 60 * 60,                // 1 hour - for movie listings
  SCREENINGS: 15 * 60,            // 15 minutes - for screening data
  USER_DATA: 5 * 60,              // 5 minutes - for user-specific data
  SEAT_AVAILABILITY: 2 * 60,      // 2 minutes - for seat availability
};

export async function cacheGet(key) {
  try {
    const redis = await getCacheRedis();
    const data = await redis.get(key);
    if (data) {
      console.log(`Cache HIT: ${key}`);
      return JSON.parse(data);
    }
    console.log(`Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error(`Cache GET error for key ${key}:`, error.message);
    return null;
  }
}

export async function cacheSet(key, data, ttl = CACHE_TTL.MOVIES) {
  try {
    const redis = await getCacheRedis();
    await redis.setEx(key, ttl, JSON.stringify(data));
    console.log(`Cache SET: ${key} (TTL: ${ttl}s)`);
    return true;
  } catch (error) {
    console.error(`Cache SET error for key ${key}:`, error.message);
    return false;
  }
}

export async function cacheDelPattern(pattern) {
  try {
    const redis = await getCacheRedis();
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      const deleted = await redis.del(keys);
      console.log(`Cache DEL PATTERN: ${pattern} (${deleted} keys deleted)`);
      return deleted;
    }
    return 0;
  } catch (error) {
    console.error(`Cache DEL PATTERN error for pattern ${pattern}:`, error.message);
    return 0;
  }
}

export const CacheInvalidation = {
  onMovieChange: async () => {
    await cacheDelPattern('cache:movies:*');
    await cacheDelPattern('cache:screenings:*');
  },

  onScreeningChange: async () => {
    await cacheDelPattern('cache:screenings:*');
    await cacheDelPattern('cache:movies:upcoming:*');
  },

  onCinemaChange: async () => {
    await cacheDelPattern('cache:cinemas*');
    await cacheDelPattern('cache:rooms*');
    await cacheDelPattern('cache:screenings:*');
    await cacheDelPattern('cache:movies:upcoming:*');
  },

  onUserTicketChange: async () => {
    await cacheDelPattern('cache:user:*:tickets');
  },

  onStaticDataChange: async () => {
    await cacheDelPattern('cache:genres*');
    await cacheDelPattern('cache:ticket_types*');
    await cacheDelPattern('cache:qualities*');
  },
};