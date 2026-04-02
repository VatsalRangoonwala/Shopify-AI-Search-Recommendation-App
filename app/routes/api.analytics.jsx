import prisma from "../db.server.js";
import { authenticate } from "../shopify.server.js";
import { getAnalytics } from "../services/analytics.service.js";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const store = await prisma.store.findUnique({
    where: { shop: session.shop },
  });

  if (!store) return json({});

  const analytics = await getAnalytics(store.id);

  return {
    searches: analytics.searches,
    clicks: analytics.clicks,
    carts: analytics.carts,
    purchases: analytics.purchases,
    conversionRate: analytics.conversionRate,
  };
};
