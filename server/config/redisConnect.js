import { createClient } from 'redis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const baseConfig = { url: `redis://${redisHost}:6379` };

const MAX_RETRIES = 10;   // Max retries before giving up
const RETRY_DELAY = 5000; // 5 seconds

// Rate Limiting Redis Client (Database 0)
const rateLimitRedis = createClient({
  ...baseConfig,
  database: 0,
});

// Auth Redis Client (Database 1) 
const authRedis = createClient({
  ...baseConfig,
  database: 1,
});

// Cache Redis Client (Database 2)
const cacheRedis = createClient({
  ...baseConfig,
  database: 2,
});

rateLimitRedis.on('error', (err) => console.error('Rate Limit Redis Error', err));
authRedis.on('error', (err) => console.error('Auth Redis Error', err));
cacheRedis.on('error', (err) => console.error('Cache Redis Error', err));

export async function connectRedis() {
  await Promise.all([
    rateLimitRedis.connect(),
    authRedis.connect(),
    cacheRedis.connect()
  ]);
}

export async function getRateLimitRedis() {
  if (!rateLimitRedis.isOpen) await rateLimitRedis.connect();
  return rateLimitRedis;
}

export async function getAuthRedis() {
  if (!authRedis.isOpen) await authRedis.connect();
  return authRedis;
}

export async function getCacheRedis() {
  if (!cacheRedis.isOpen) await cacheRedis.connect();
  return cacheRedis;
}

async function testRedisConnectionWithRetry(retries = 0) {
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
    rateLimitClient.close();
    authClient.close();
    cacheClient.close();
    
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
