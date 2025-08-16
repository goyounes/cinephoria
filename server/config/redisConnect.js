import { createClient } from 'redis';

const redisHost = process.env.REDIS_HOST || 'localhost';
const baseConfig = { url: `redis://${redisHost}:6379` };

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

rateLimitRedis.on('error', (err) => console.error('Rate Limit Redis Error', err));
authRedis.on('error', (err) => console.error('Auth Redis Error', err));

export async function connectRedis() {
  await Promise.all([
    rateLimitRedis.connect(),
    authRedis.connect()
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
