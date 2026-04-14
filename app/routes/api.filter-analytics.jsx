// app/routes/api.analytics.jsx
import prisma from "../db.server.js";
import { authenticate } from "../shopify.server.js";
import { getAnalytics } from "../services/analytics.service.js";
import { getTrendsData } from "../services/trends.service.js";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const store = await prisma.store.findUnique({
    where: { shop: session.shop },
    select: { id: true },
  });

  const period = new URL(request.url).searchParams.get("period") || "week";

  if (!store) return Response.json({}, { status: 404 });

  const [kpiData, trends] = await Promise.all([
    getAnalytics(store.id),
    getTrendsData(store.id, period),
  ]);

  return Response.json({ ...kpiData, trends });
};
