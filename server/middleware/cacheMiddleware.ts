import { Request, Response, NextFunction } from 'express';
import { cacheGet, cacheSet, CacheInvalidation } from './cacheUtils.js';

// Extend Express Request to include cacheInfo
declare global {
  namespace Express {
    interface Request {
      cacheInfo?: {
        key: string;
        ttl: number;
      };
    }
  }
}

export function tryCache(cacheKey: string, ttl: number) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cachedData = await cacheGet(cacheKey);
      if (cachedData !== null) {
        res.status(200).json(cachedData);
        return;
      }
      req.cacheInfo = { key: cacheKey, ttl };
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}

export async function saveToCache(req: Request, data: any): Promise<void> {
  if (!req.cacheInfo || !data) return;

  try {
    await cacheSet(req.cacheInfo.key, data, req.cacheInfo.ttl);
  } catch (err) {
    console.error('Failed to cache response:', err);
  }
}

type CacheGroup = 'movies' | 'screenings' | 'cinemas' | 'tickets' | 'static' | string;

export async function invalidateCache(cacheGroup: CacheGroup): Promise<void> {
  try {
    switch (cacheGroup) {
      case 'movies':
        await CacheInvalidation.onMovieChange();
        await CacheInvalidation.onMoviesChange();
        break;
      case 'screenings':
        await CacheInvalidation.onScreeningChange();
        await CacheInvalidation.onScreeningsChange();
        break;
      case 'cinemas':
        await CacheInvalidation.onCinemaChange();
        break;
      case 'tickets':
        await CacheInvalidation.onUserTicketChange();
        break;
      case 'static':
        await CacheInvalidation.onStaticDataChange();
        break;
      default:
        // Handle specific cache keys that don't match predefined groups
        if (cacheGroup.includes(':')) {
          const cacheKey = `cache:${cacheGroup}`;
          const { cacheDelPattern } = await import('./cacheUtils.js');
          const deleted = await cacheDelPattern(cacheKey);
          console.log(`Invalidated specific cache key: ${cacheKey} (${deleted} keys deleted)`);
        } else {
          console.warn(`Unknown cache group: ${cacheGroup}`);
        }
    }
  } catch (err) {
    console.error(`Failed to invalidate cache group ${cacheGroup}:`, err);
  }
}
