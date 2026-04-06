import prisma from "../db.server.js";

export async function getAnalytics(storeId) {
  const stats = await prisma.event.groupBy({
    by: ["type"],
    where: { storeId },
    _count: { _all: true },
  });

  const counts = stats.reduce((acc, item) => {
    acc[item.type] = {
      count: item._count._all,
    };
    return acc;
  }, {});

  const totalSearches = counts["search"]?.count || 0;
  const recommendationsShown = counts["recommendation_view"]?.count || 0;
  const recommendationClicks = counts["recommendation_click"]?.count || 0;

  const ctr = recommendationsShown
    ? ((recommendationClicks / recommendationsShown) * 100).toFixed(1)
    : 0;

  const conversionRate = recommendationClicks
    ? (((counts["purchase"]?.count || 0) / recommendationClicks) * 100).toFixed(1)
    : 0;

  return {
    totalSearches: totalSearches.toLocaleString(),
    recommendationsShown: recommendationsShown.toLocaleString(),
    recommendationClicks: recommendationClicks.toLocaleString(),
    conversionBoost: `${conversionRate}%`,
    revenueInfluenced: "$0", 
    raw: {
      totalSearches,
      recommendationsShown,
      recommendationClicks,
      conversionRate,
      revenueInfluenced: 0,
    },
  };
}