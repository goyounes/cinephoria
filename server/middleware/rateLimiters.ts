import { Request, Response, NextFunction } from 'express';
import { getRateLimitRedis } from '../config/redisConnect.js';

// Custom rate limiter factory because of compatibility issues with express-rate-limit and rate-limit-redis
// This allows us to use Redis for rate limiting without the need for a separate package
export const createRateLimit = (windowMs: number, max: number, prefix: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const redis = await getRateLimitRedis();
      if (!redis) {
        next(); // Graceful fallback if Redis unavailable
        return;
      }

      const key = `${prefix}:${req.user?.user_id || req.ip}`;

      const currentResult = await redis.incr(key);
      const current = typeof currentResult === 'number' ? currentResult : parseInt(currentResult, 10);

      if (current === 1) {
        // First request, set expiration
        await redis.expire(key, Math.ceil(windowMs / 1000));
      }

      if (current > max) {
        res.status(429).json({ error: 'Rate limit exceeded' });
        return;
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
export const bookingLimiter = createRateLimit(60 * 60 * 1000, 10, 'booking_limit'); // 10 requests per hour
