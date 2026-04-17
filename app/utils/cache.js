import { redis } from "../config/redis.js";

const CACHE_TIMEOUT_MS = 150;

function withTimeout(promise, timeoutMs = CACHE_TIMEOUT_MS) {
  let timeoutId;

  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error("Cache operation timed out"));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

export async function getCache(key) {
  try {
    const data = await withTimeout(redis.get(key));
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCache(key, value, ttl = 300) {
  if (value === undefined) return;

  try {
    await withTimeout(redis.set(key, JSON.stringify(value), "EX", ttl));
  } catch {
    // Cache failures should never block storefront responses.
  }
}
