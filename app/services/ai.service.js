import { getCache, setCache } from "../utils/cache.js";

const AI_BASE_URL = process.env.AI_BASE_URL;

// 🔍 SEARCH
export async function aiSearch(shop, input) {
  const cacheKey = `ai:search:${input.query_text}`;

  // const cached = await getCache(cacheKey);
  // if (cached) {
  //   console.log("⚡ AI search cache hit");
  //   return cached;
  // }

  try {
    const res = await fetch(`${AI_BASE_URL}/search/${shop}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const data = await res.json();

    // await setCache(cacheKey, data, 300); // 5 min

    return data;
  } catch (error) {
    console.error("AI failed");

    const fallback = await getCache(cacheKey);

    if (fallback) return fallback;

    throw err;
  }
}

// 🎯 RECOMMEND
export async function aiRecommend(shop, input) {
  const key = JSON.stringify(input);
  const cacheKey = `ai:recommend:${Buffer.from(key).toString("base64")}`;

  // const cached = await getCache(cacheKey);
  // if (cached) {
  //   console.log("⚡ AI recommend cache hit");
  //   return cached;
  // }

  const res = await fetch(`${AI_BASE_URL}/recommend/${shop}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const data = await res.json();

  // await setCache(cacheKey, data, 300);

  return data;
}

// 🔗 SIMILAR
export async function aiSimilar(shop, productId, input) {
  const cacheKey = `ai:similar:${productId}`;

  // const cached = await getCache(cacheKey);
  // if (cached) {
  //   console.log("⚡ AI similar cache hit");
  //   return cached;
  // }

  const res = await fetch(
    `${AI_BASE_URL}/search/${shop}/similar/${productId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
  );

  const data = await res.json();

  // await setCache(cacheKey, data, 600); // longer cache

  return data;
}
