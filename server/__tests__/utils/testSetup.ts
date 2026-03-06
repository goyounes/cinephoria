// Global test setup
import dotenv from 'dotenv';

process.env.NODE_ENV = 'test';
dotenv.config({ path: '.test.env', quiet: true });

import { jest, beforeAll, afterAll } from '@jest/globals';
import { rateLimitRedis, authRedis, cacheRedis, connectRedis } from '../../config/redisConnect.js';

// Mock console.log for cleaner test output
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeAll(async () => {
  // Suppress console.log during tests unless needed
  if (!process.env.VERBOSE_TESTS) {
    console.log = jest.fn() as unknown as typeof console.log;
    console.error = jest.fn() as unknown as typeof console.error;
  }

  // Clear Redis databases to avoid interference from previous test runs
  try {
    await connectRedis();

    await Promise.all([
      rateLimitRedis.flushDb(),
      authRedis.flushDb(),
      cacheRedis.flushDb()
    ]);
  } catch (error) {
    // Continue if Redis is not available
    // With reconnectStrategy: false in test mode, connect() rejects fast
    // and clients are automatically closed — no manual cleanup needed
    const err = error as Error;
    console.warn('Could not clear Redis databases:', err.message);
  }
});

afterAll(async () => {
  // Restore console functions
  console.log = originalConsoleLog;
  console.error = originalConsoleError;

  // Clean up Redis clients if they're still connected
  if (rateLimitRedis.isOpen) rateLimitRedis.destroy();
  if (authRedis.isOpen) authRedis.destroy();
  if (cacheRedis.isOpen) cacheRedis.destroy();
});
