import prisma from "../db.server.js";

export async function getAnalytics(storeId) {
  const evenTypes = ["search", "recommendation_click", "purchase"];

  const [totalSearches, recommendationClicks, purchases] = await Promise.all(
    evenTypes.map((type) => prisma.event.count({ where: { storeId, type } })),
  );

  // const productMap = {};

  // let totalSearches = 0;
  // let recommendationsShown = 0;
  // let recommendationClicks = 0;
  // let purchases = 0;

  // events.forEach((e) => {
  //   if (!productMap[e.productId]) {
  //     productMap[e.productId] = {
  //       productId: e.productId,
  //       searches: 0,
  //       clicks: 0,
  //       views: 0,
  //     };
  //   }

  //   switch (e.type) {
  //     case "search":
  //       productMap[e.productId].searches++;
  //       totalSearches++;
  //       break;

  //     case "recommendation_view":
  //       productMap[e.productId].views++;
  //       recommendationsShown++;
  //       break;

  //     case "recommendation_click":
  //       productMap[e.productId].clicks++;
  //       recommendationClicks++;
  //       break;

  //     case "purchase":
  //       purchases++;
  //       break;
  //   }
  // });

  // CTR = Clicks / Views
  // const ctr = recommendationsShown
  //   ? ((recommendationClicks / recommendationsShown) * 100).toFixed(1)
  //   : "0.0";

  // Conversion Rate = Purchases / Clicks
  const conversionRate = recommendationClicks
    ? ((purchases / recommendationClicks) * 100).toFixed(1)
    : "0.0";

  return {
    totalSearches,
    recommendationClicks,
    purchases,
    // ctr: `${ctr}%`,
    conversionRate: `${conversionRate}%`,
    revenueInfluenced: 0, // update when revenue tracking exists
    formatted: {
      totalSearches: totalSearches.toLocaleString(),
      // recommendationsShown: recommendationsShown.toLocaleString(),
      recommendationClicks: recommendationClicks.toLocaleString(),
      purchases: purchases.toLocaleString(),
      // ctr: `${ctr}%`,
      conversionRate: `${conversionRate}%`,
      revenueInfluenced: "$0",
    },
  };
}

export async function fetchTotalProductsCount(admin) {
  const query = `query {
  productsCount {
    count
    precision
  }
}`;
  const response = await admin.graphql(query);
  const data = await response.json();
  const count = data?.data?.productsCount?.count;
  return count;
}
