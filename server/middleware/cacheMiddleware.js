import { cacheGet, cacheSet, CacheInvalidation } from './cacheUtils.js';

export function tryCache(cacheKey, ttl) {
  return async (req, res, next) => {
    try {
      const cachedData = await cacheGet(cacheKey);
      if (cachedData !== null) {
        return res.status(200).json(cachedData);
      }
      req.cacheInfo = { key: cacheKey, ttl };
      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}

export async function saveToCache(req, data) {
  if (!req.cacheInfo || !data) return;
  
  try {
    await cacheSet(req.cacheInfo.key, data, req.cacheInfo.ttl);
  } catch (err) {
    console.error('Failed to cache response:', err);
  }
}

export async function invalidateCache(cacheGroup) {
  try {
    switch (cacheGroup) {
      case 'movies':
        await CacheInvalidation.onMovieChange();
        break;
      case 'screenings':
        await CacheInvalidation.onScreeningChange();
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
        console.warn(`Unknown cache group: ${cacheGroup}`);
    }
  } catch (err) {
    console.error(`Failed to invalidate cache group ${cacheGroup}:`, err);
  }
}


