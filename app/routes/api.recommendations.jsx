import prisma from "../db.server.js";
import { aiRecommend } from "../services/ai.service.js";
import { hydrateProducts } from "../services/recommendation.service.js";
import { getUserBehavior } from "../services/personalization.service.js";

export const action = async ({ request }) => {
  const body = await request.json();

  const { shop, sessionId } = body;

  const store = await prisma.store.findUnique({
    where: { shop },
  });

  if (!store) return [];

  // 🔥 Step 1: Extract behavior
  const behavior = await getUserBehavior(store.id, sessionId);

  let aiResults;

  try {
    // 🔥 Step 2: AI recommendation
    aiResults = await aiRecommend(shop, {
      viewed_ids: behavior.viewed.slice(0, 10),
      added_to_cart_ids: behavior.cart.slice(0, 10),
      purchased_ids: behavior.purchased.slice(0, 10),
      filters: {},
      limit: 12,
    });
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
  });
}
