// Global test setup
import { jest } from '@jest/globals';
import { getRateLimitRedis, getAuthRedis } from './redisConnect.js';

// Mock console.log for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Mock rate limiters early - before any imports
jest.mock('../config/rateLimiters.js', () => ({
  authLimiter: (req, res, next) => next(),
  browsingLimiter: (req, res, next) => next(),
  bookingLimiter: (req, res, next) => next(),
  createRateLimit: () => (req, res, next) => next()
}));

beforeAll(async () => {
  // Suppress console.log during tests unless needed
  if (!process.env.VERBOSE_TESTS) {
    console.log = jest.fn();
    console.error = jest.fn();
  }
  
  // Clear Redis databases to avoid interference from previous test runs
  try {
    const rateLimitRedis = await getRateLimitRedis();
    const authRedis = await getAuthRedis();
    
    await Promise.all([
      rateLimitRedis.flushDb(),
      authRedis.flushDb()
    ]);
  } catch (error) {
    // Continue if Redis is not available
    console.warn('Could not clear Redis databases:', error.message);
  }
});

afterAll(() => {
  // Restore console functions
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});