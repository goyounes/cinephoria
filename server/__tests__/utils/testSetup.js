// Global test setup
process.env.NODE_ENV = 'test';
const testEnv = await import('dotenv');
testEnv.config({ path: '.test.env', quiet: true });

import { jest } from '@jest/globals';
import { getRateLimitRedis, getAuthRedis, getCacheRedis } from '../../config/redisConnect.js';

// Mock console.log for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// No longer need to mock rate limiters - using dependency injection instead

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
    const cacheRedis = await getCacheRedis();
    
    await Promise.all([
      rateLimitRedis.flushDb(),
      authRedis.flushDb(),
      cacheRedis.flushDb()
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