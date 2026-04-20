import { getCache, setCache } from "../utils/cache.js";

const AI_BASE_URL = process.env.AI_BASE_URL;
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 3500);

function buildCacheKey(prefix, shop, input) {
  return `${prefix}:${shop}:${Buffer.from(JSON.stringify(input)).toString("base64url")}`;
}

function buildTimedSignal(parentSignal) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error("AI request timed out"));
  }, AI_TIMEOUT_MS);

  const abortFromParent = () => {
    controller.abort(parentSignal?.reason || new Error("Request aborted"));
  };

  if (parentSignal) {
    if (parentSignal.aborted) {
      abortFromParent();
    } else {
      parentSignal.addEventListener("abort", abortFromParent, { once: true });
    }
  }

  return {
    signal: controller.signal,
    cleanup() {
      clearTimeout(timeoutId);
      parentSignal?.removeEventListener("abort", abortFromParent);
    },
  };
}

async function fetchAiJson(path, input, { signal, cacheKey, ttl } = {}) {
  if (!AI_BASE_URL) {
    throw new Error("AI_BASE_URL is not configured");
  }

  const cached = cacheKey ? await getCache(cacheKey) : null;

  if (cached) {
    return cached;
  }

  const { signal: timedSignal, cleanup } = buildTimedSignal(signal);

  try {
    const response = await fetch(`${AI_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal: timedSignal,
    });

    if (!response.ok) {
      throw new Error(`AI request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (cacheKey && data) {
      void setCache(cacheKey, data, ttl);
    }

    return data;
  } finally {
    cleanup();
  }
}

// Search
export async function aiSearch(shop, input, options = {}) {
  return fetchAiJson(`/search/${shop}`, input, {
    ...options,
    cacheKey: buildCacheKey("ai:search", shop, input),
    ttl: 60,
  });
}

// Recommend
export async function aiRecommend(shop, input, options = {}) {
  return fetchAiJson(`/recommend/${shop}`, input, {
    ...options,
    cacheKey: buildCacheKey("ai:recommend", shop, input),
    ttl: 120,
  });
}

// Similar
export async function aiSimilar(shop, productId, input, options = {}) {
  return fetchAiJson(`/search/${shop}/similar/${productId}`, input, {
    ...options,
    cacheKey: buildCacheKey("ai:similar", shop, { productId, ...input }),
    ttl: 180,
  });
}

export const normalizeAIProduct = (product) => {
  try {
    return {
      product_id: product?.shopifyProductId,
      title: product?.title,
      description: product?.description ?? "",
      brand: product?.vendor ?? "",
      category: product?.productType ?? "",
      tags: product?.tags ?? [],
      metadata: {
        weight: 0,
        color: product?.attributes?.color ?? "",
        size: product?.attributes?.size ?? "",
        material:
          product?.attributes?.material ?? product?.attributes?.fabric ?? "",
        gender: product?.attributes?.gender ?? "",
        age_group: product?.attributes?.ageGroup ?? "",
        season: product?.attributes?.season ?? "",
        collection: product?.collection ?? "",
        price: parseFloat(product?.maxPrice),
        is_available:
          product?.availableForSale !== "Out of St ock" ? true : false,
      },
    };
  } catch (error) {
    console.log(error);
  }
};
