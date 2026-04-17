import prisma from "../db.server.js";
import { aiSimilar } from "../services/ai.service.js";
import { hydrateProducts } from "../services/recommendation.service.js";

export const action = async ({ request }) => {
  const body = await request.json();
  const { shop, productId, limit } = body;

  const store = await prisma.store.findUnique({
    where: { shop },
    select: {
      id: true,
      diversity: true,
    },
  });

  if (!store) {
    return [];
  }

  const aiResults = await aiSimilar(
    shop,
    productId,
    {
      filters: {},
      limit,
      diversity_penalty: store.diversity,
    },
    { signal: request.signal },
  );

  return hydrateProducts(store.id, aiResults);
};
