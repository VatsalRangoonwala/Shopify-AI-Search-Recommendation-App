import prisma from "../db.server.js";
import { authenticate } from "../shopify.server.js";
import { getAnalytics } from "../services/analytics.service.js";
import { getTrendsData } from "../services/trends.service.js";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const store = await prisma.store.findUnique({
    where: { shop: session.shop },
  });

  const url = new URL(request.url);
  const period = url.searchParams.get("period") || "week";

  if (!store) return json({});

  const [kpiData, trends] = await Promise.all([
    getAnalytics(store.id),
    getTrendsData(store.id, period),
  ]);

  return {
    ...kpiData,
    trends,
  };
};
