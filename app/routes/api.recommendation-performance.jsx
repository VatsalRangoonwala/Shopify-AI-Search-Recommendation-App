import prisma from "../db.server.js";
import { authenticate } from "../shopify.server.js";
import { getRecommendationPerformance } from "../services/recommendationPerformance.service.js";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const store = await prisma.store.findUnique({
    where: { shop: session.shop },
  });

  if (!store) return [];

  const data = await getRecommendationPerformance(store.id);

  return data;
};