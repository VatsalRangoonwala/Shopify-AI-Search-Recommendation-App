import prisma from "../db.server.js";

export async function hydrateProducts(
  storeId,
  aiResults,
  filterQuery = {},
  sortingQuery = { createdAt: "desc" },
  limit = 20,
) {
  const ids = (aiResults?.results ?? []).map((r) => String(r.product_id));

  if (!ids.length) {
    return prisma.product.findMany({
      where: { storeId, ...filterQuery },
      orderBy: sortingQuery,
      take: limit,
    });
  }

  const recommended = await prisma.product.findMany({
    where: {
      storeId,
      shopifyProductId: { in: ids },
      ...filterQuery,
    },
  });

  const productMap = new Map(
    recommended.map((p) => [p.shopifyProductId, { ...p, isRecommended: true }]),
  );

  const orderedRecommended = ids.map((id) => productMap.get(id)).filter(Boolean);

  if (orderedRecommended.length >= limit) {
    return orderedRecommended.slice(0, limit);
  }

  const fallback = await prisma.product.findMany({
    where: {
      storeId,
      shopifyProductId: { notIn: ids },
      ...filterQuery,
    },
    orderBy: sortingQuery,
    take: limit - orderedRecommended.length,
  });

  return [...orderedRecommended, ...fallback];
}
