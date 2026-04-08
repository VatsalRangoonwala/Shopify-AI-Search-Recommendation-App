import prisma from "../db.server.js";
import { aiSimilar } from "../services/ai.service.js";
import { hydrateProducts } from "../services/recommendation.service.js";

export const action = async ({ request }) => {
  const body = await request.json();
  const { shop, productId, limit } = body;

  const store = await prisma.store.findUnique({
    where: { shop },
  });

  const aiResults = await aiSimilar(shop, productId, {
    filters: {},
    limit: limit,
    diversity_penalty: 0.0,
  });
  const ids = aiResults.results.map((r) => r.product_id.toString());
  const products = await prisma.product.findMany({
    where: {
      shopifyProductId: { in: ids },
      storeId: store.id,
    },
  });
  return products;
};
