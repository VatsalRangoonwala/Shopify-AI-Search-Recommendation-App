import prisma from "../db.server.js";

export async function hydrateProducts(
  storeId,
  aiResults,
  filterQuery,
  sortingQuery,
) {
  const ids = aiResults.results.map((r) => r.product_id.toString());

  const products = await prisma.product.findMany({
    where: {
      shopifyProductId: { in: ids },
      storeId,
      ...filterQuery,
    },
    orderBy: sortingQuery,
  });

  const recproduct = products.map((p) => ({ ...p, isRecommended: true }));

  return recproduct;
}
