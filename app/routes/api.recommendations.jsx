import prisma from "../db.server.js";
import { aiRecommend } from "../services/ai.service.js";
import {
  hydrateProducts,
  PRODUCT_CARD_SELECT,
} from "../services/recommendation.service.js";
import { getUserBehavior } from "../services/personalization.service.js";

export const action = async ({ request }) => {
  const body = await request.json();

  const { shop, sessionId, filters } = body;

  if (Array.isArray(filters.price)) {
    const price = filters.price.map((p) => parseFloat(p) + 0.0000001);
    filters.price = { min: price[0], max: price[1] };
  }
  if (Array.isArray(filters.productType)) {
    filters.category = filters.productType;
    delete filters["productType"];
  }

  if (Array.isArray(filters.vendor)) {
    filters.brand = filters.vendor;
    delete filters["vendor"];
  }

  if (Array.isArray(filters.availability)) {
    filters.is_available = filters.availability[0] == "In Stock" ? true : false;
    delete filters["availability"];
  }
  const store = await prisma.store.findUnique({
    where: { shop },
    select: {
      id: true,
      diversity: true,
    },
  });

  if (!store) return [];

  // 🔥 Step 1: Extract behavior
  const behavior = await getUserBehavior(store.id, sessionId);

  let aiResults;

  try {
    // 🔥 Step 2: AI recommendation
    aiResults = await aiRecommend(
      shop,
      {
        viewed_ids: behavior.viewed.slice(0, 10),
        added_to_cart_ids: behavior.cart.slice(0, 10),
        purchased_ids: behavior.purchased.slice(0, 10),
        filters: filters,
        limit: 12,
        diversity_penalty: store.diversity,
      },
      { signal: request.signal },
    );
  } catch (err) {
    console.log("AI failed → fallback");

    return fallbackProducts(store.id);
  }

  // 🔥 Step 3: Hydrate
  const products = await hydrateProducts(store.id, aiResults);

  // 🔥 Step 4: Fallback if empty
  if (!products.length) {
    return fallbackProducts(store.id);
  }

  return products;
};

// 🔥 fallback logic
async function fallbackProducts(storeId) {
  return prisma.product.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 12,
    select: PRODUCT_CARD_SELECT,
  });
}
