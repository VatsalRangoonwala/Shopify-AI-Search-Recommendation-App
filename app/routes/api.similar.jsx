import prisma from "../db.server.js";
import { aiSimilar } from "../services/ai.service.js";
import { hydrateProducts } from "../services/recommendation.service.js";

export const action = async ({ request }) => {
  const body = await request.json();
  const { shop, productId } = body;

  const store = await prisma.store.findUnique({
    where: { shop },
  });

  const aiResults = await aiSimilar(shop, productId, { filters: {}, limit: 10 });

  const products = await hydrateProducts(store.id, aiResults);

  return products;
};
