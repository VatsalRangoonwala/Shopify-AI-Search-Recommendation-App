import prisma from "../db.server.js";

export async function getRecommendationPerformance(storeId) {

  const events = await prisma.event.findMany({
    where: {
      storeId,
      type: {
        in: ["recommendation_view", "recommendation_click"],
      },
    },
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
        impressions: 0,
        clicks: 0,
      };
    }

    if (e.type === "recommendation_view") {
      productMap[e.productId].impressions++;
    }

    if (e.type === "recommendation_click") {
      productMap[e.productId].clicks++;
    }
  });

  const productIds = Object.keys(productMap);

  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
    select: {
      id: true,
      title: true,
    },
  });

  const productTitleMap = {};
  products.forEach((p) => {
    productTitleMap[p.id] = p.title;
  });

  const result = Object.values(productMap).map((p) => {
    const ctr =
      p.impressions > 0
        ? ((p.clicks / p.impressions) * 100).toFixed(1)
        : "0";

    let performance = "average";
    if (ctr >= 15) performance = "high";
    else if (ctr < 5) performance = "low";

    return {
      name: productTitleMap[p.productId] || "Unknown Product",
      impressions: p.impressions,
      clicks: p.clicks,
      ctr: ctr + "%",
      performance,
    };
  });

  return result.sort((a, b) => b.impressions - a.impressions).slice(0, 10);
}