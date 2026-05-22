import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

export const redis = createClient({ url: process.env.REDIS_URL });
redis.on('error', (error) => console.warn('Redis unavailable:', error.message));

export async function connectRedis() {
  if (!redis.isOpen) await redis.connect();
}

export async function getCache(key) {
  if (!redis.isOpen) return null;
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
}

export async function setCache(key, value, seconds) {
  if (redis.isOpen) await redis.setEx(key, seconds, JSON.stringify(value));
}

export async function invalidate(pattern) {
  if (!redis.isOpen) return;
  const keys = await redis.keys(pattern);
  if (keys.length) await redis.del(keys);
}
