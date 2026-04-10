import prisma from "../db.server.js";

export async function getFilterAnalytics(storeId) {
  const totalProducts = await prisma.product.count({
    where: { storeId },
  });

  const filters = await prisma.filter.findMany({
    where: {
      storeId,
      status: "selected",
      isVisible: true,
    },
    select: {
      label: true,
      productCount: true,
    },
  });

  const result = [];

  for (const filter of filters) {
    let usageCount = filter.productCount;

    const percentage =
      totalProducts > 0 ? Math.round((usageCount / totalProducts) * 100) : 0;

    const dropoff = Math.max(0, 100 - percentage);

    result.push({
      name: filter.label,
      usage: usageCount,
      percentage,
      dropoff: dropoff + "%",
    });
  }

  return result.sort((a, b) => b.usage - a.usage).slice(0, 10);
}
