import prisma from "../db.server.js";
import { authenticate } from "../shopify.server.js";
import { getFilterAnalytics } from "../services/filterAnalytics.service.js";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const store = await prisma.store.findUnique({
    where: { shop: session.shop },
    select: { id: true },
  });

  if (!store) return [];

  const data = await getFilterAnalytics(store.id);

  return data;
};
