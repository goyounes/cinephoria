// Global test setup
process.env.NODE_ENV = 'test';
const testEnv = await import('dotenv');
testEnv.config({ path: '.test.env', quiet: true });

import { jest } from '@jest/globals';
import { rateLimitRedis, authRedis, cacheRedis, connectRedis } from '../../config/redisConnect.js';

// Mock console.log for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// No longer need to mock rate limiters - using dependency injection instead

beforeAll(async () => {
  // Suppress console.log during tests unless needed
  if (!process.env.VERBOSE_TESTS) {
    console.log = jest.fn() as unknown as typeof console.log;
    console.error = jest.fn() as unknown as typeof console.error;
  }

  // Clear Redis databases to avoid interference from previous test runs
  try {
    // Connect Redis clients (like MySQL pool pattern)
    await connectRedis();

    // Now flush the databases
    await Promise.all([
      rateLimitRedis.flushDb(),
      authRedis.flushDb(),
      cacheRedis.flushDb()
    ]);
  } catch (error) {
    // Continue if Redis is not available
    const err = error as Error;
    console.warn('Could not clear Redis databases:', err.message);
  }
});

afterAll(() => {
  // Restore console functions
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
