import { createClient } from 'redis';

const redisHost = process.env.REDIS_HOST || 'localhost';  // Use env var or localhost

const client = createClient({
  url: `redis://${redisHost}:6379`,
});

client.on('error', (err) => console.error('Redis Client Error', err));

let isConnecting = false;

export async function connectRedis() {
  if (!client.isOpen && !isConnecting) {
    isConnecting = true;
    try {
      await client.connect();
    } catch (err) {
      console.error('Failed to connect Redis:', err);
      throw err;
    } finally {
      isConnecting = false;
    }
  }
}

// Helper to get connected client safely (connects if needed)
export async function getRedisClient() {
  if (!client.isOpen) {
    await connectRedis();
  }
  return client;
}

export { client };