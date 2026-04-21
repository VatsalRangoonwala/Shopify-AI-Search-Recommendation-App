import prisma from "../db.server.js";
import { aiRecommend, normalizeAiFilters } from "../services/ai.service.js";
import {
  hydrateProducts,
  PRODUCT_CARD_SELECT,
} from "../services/recommendation.service.js";
import { getUserBehavior } from "../services/personalization.service.js";

export const action = async ({ request }) => {
  const body = await request.json();

  const { shop, sessionId, filters } = body;

  const normalizeAi = normalizeAiFilters(filters);

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
        filters: normalizeAi,
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
