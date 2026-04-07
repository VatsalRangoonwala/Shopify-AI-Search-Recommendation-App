import prisma from "../db.server.js";

export async function getFilterAnalytics(storeId) {

  const totalProducts = await prisma.product.count({
    where: { storeId },
  });

  const filters = await prisma.filter.findMany({
    where: {
      storeId,
      isVisible: true,
    },
    select: {
      key: true,
      label: true,
      sourceField: true,
      values: true,
    },
  });

  const result = [];

  for (const filter of filters) {
    let usageCount = 0;


    if (filter.sourceField === "vendor") {
      usageCount = await prisma.product.count({
        where: {
          storeId,
          vendor: { not: null },
        },
      });
    }

    else if (filter.sourceField === "productType") {
      usageCount = await prisma.product.count({
        where: {
          storeId,
          productType: { not: null },
        },
      });
    }

    else if (filter.sourceField === "tags") {
      usageCount = await prisma.product.count({
        where: {
          storeId,
          tags: {
            isEmpty: false,
          },
        },
      });
    }

    else {
  
      usageCount = filter.values?.length || 0;
    }

    const percentage =
      totalProducts > 0
        ? Math.round((usageCount / totalProducts) * 100)
        : 0;

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