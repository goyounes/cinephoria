import { getRateLimitRedis } from './redisConnect.js';

//  custom rate limiter factory because of compatibility issues with express-rate-limit and rate-limit-redis
//  this allows us to use Redis for rate limiting without the need for a separate package
export const createRateLimit = (windowMs, max, prefix) => {
  return async (req, res, next) => {
    try {
      const redis = await getRateLimitRedis();
      if (!redis) return next(); // Graceful fallback if Redis unavailable
      
      const key = `${prefix}:${req.user?.user_id || req.ip}`;
      
      const current = await redis.incr(key);
      
      if (current === 1) {
        // First request, set expiration
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }
      
      if (current > max) {
        return res.status(429).json({ error: 'Rate limit exceeded' });
      }
      
      next();
    } catch (error) {
      // If Redis fails, continue without rate limiting
      next();
    }
  };
};

export const authLimiter = createRateLimit(15 * 60 * 1000, 100, 'auth_limit');      // 100 requests per 15 minutes
export const browsingLimiter = createRateLimit(60 * 1000, 100, 'browsing_limit');   // 100 requests per minute
export const bookingLimiter = createRateLimit(60 * 60 * 1000, 10, 'booking_limit'); // 10  requests per hour