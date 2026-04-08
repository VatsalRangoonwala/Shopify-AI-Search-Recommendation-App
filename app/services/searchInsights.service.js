import prisma from "../db.server.js";

export async function getSearchInsights(storeId) {

  const events = await prisma.event.findMany({
    where: { storeId },
    select: {
      type: true,
      productId: true,
    },
  });

  const productMap = {};

  events.forEach((e) => {
    if (!productMap[e.productId]) {
      productMap[e.productId] = {
        productId: e.productId,
        searches: 0,
        clicks: 0,
        views: 0,
      };
    }

    if (e.type === "search") productMap[e.productId].searches++;
    if (e.type === "recommendation_click") productMap[e.productId].clicks++;
    if (e.type === "recommendation_view") productMap[e.productId].views++;
  });

  const productIds = Object.keys(productMap);

 const products = await prisma.product.findMany({
  where: {
    shopifyProductId: { in: productIds },
  },
  select: {
    shopifyProductId: true,
    title: true,
  },
});

const productTitleMap = {};
products.forEach((p) => {
  productTitleMap[p.shopifyProductId] = p.title;
});

  const result = Object.values(productMap).map((p) => {
    const clickRate =
      p.views > 0 ? ((p.clicks / p.views) * 100).toFixed(1) + "%" : "0%";

    return {
      query: productTitleMap[p.productId] || p.productId || "Unknown Product",
      results: p.searches,
      clickRate,
      status: p.searches > 0 ? "ok" : "no-results",
    };
  });

  return result.sort((a, b) => b.results - a.results).slice(0, 10);
}