import { redis } from "../config/redis.js";

export async function getCache(key) {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
}

export async function setCache(key, value, ttl = 300) {
  if (value === undefined) return;
  await redis.set(key, JSON.stringify(value), "EX", ttl);
}
