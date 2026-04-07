import prisma from "../db.server.js";
import { authenticate } from "../shopify.server.js";
import { getSearchInsights } from "../services/searchInsights.service.js";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const store = await prisma.store.findUnique({
    where: { shop: session.shop },
  });

  if (!store) return [];

  const data = await getSearchInsights(store.id);

  return data;
};