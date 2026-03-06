import { createClient } from 'redis';

const redisHost: string = process.env.REDIS_HOST || 'localhost';
const isTest = process.env.NODE_ENV === 'test';
const baseConfig = {
  url: `redis://${redisHost}:6379`,
  ...(isTest && {
    socket: {
      connectTimeout: 2000,
      reconnectStrategy: false as const,
    }
  })
};

const MAX_RETRIES = 10;   // Max retries before giving up
const RETRY_DELAY = 5000; // 5 seconds

// Export clients directly (like MySQL pool) - connected at startup via connectRedis()
export const rateLimitRedis = createClient({
  ...baseConfig,
  database: 0,
});

export const authRedis = createClient({
  ...baseConfig,
  database: 1,
});

export const cacheRedis = createClient({
  ...baseConfig,
  database: 2,
});

rateLimitRedis.on('error', (err: Error) => console.error('Rate Limit Redis Error', err));
authRedis.on('error', (err: Error) => console.error('Auth Redis Error', err));
cacheRedis.on('error', (err: Error) => console.error('Cache Redis Error', err));

export async function connectRedis(): Promise<void> {
  await Promise.all([
    rateLimitRedis.connect(),
    authRedis.connect(),
    cacheRedis.connect()
  ]);
}


async function testRedisConnectionWithRetry(retries: number = 0): Promise<void> {
  try {
    // Create fresh clients for testing (like MySQL getConnection)
    const rateLimitClient = createClient({ ...baseConfig, database: 0 });
    const authClient = createClient({ ...baseConfig, database: 1 });
    const cacheClient = createClient({ ...baseConfig, database: 2 });

    await rateLimitClient.connect();
    await authClient.connect();
    await cacheClient.connect();

    // Test ping
    await Promise.all([
      rateLimitClient.ping(),
      authClient.ping(),
      cacheClient.ping()
    ]);

    // Clean up test connections
    rateLimitClient.quit();
    authClient.quit();
    cacheClient.quit();

    console.log("Connected to Redis!");
  } catch (error) {
    if (retries >= MAX_RETRIES) {
      console.error(`Could not connect to Redis after ${retries} attempts:`, error);
      process.exit(1); // Stop app after max retries
    } else {
      console.log(`Redis not ready yet, retry ${retries + 1}/${MAX_RETRIES} - retrying in ${RETRY_DELAY / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return testRedisConnectionWithRetry(retries + 1);
    }
  }
}

// Export the connection test function for explicit use by server startup
export { testRedisConnectionWithRetry };
