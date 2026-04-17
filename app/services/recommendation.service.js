import prisma from "../db.server.js";

export const PRODUCT_CARD_SELECT = {
  id: true,
  shopifyProductId: true,
  handle: true,
  title: true,
  vendor: true,
  featuredImage: true,
  maxPrice: true,
  compareAtMaxPrice: true,
  defaultVariantId: true,
};

export async function hydrateProducts(storeId, aiResults) {
  const ids = Array.isArray(aiResults?.results)
    ? aiResults.results
        .map((result) => result?.product_id?.toString())
        .filter(Boolean)
    : [];

  if (!ids.length) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: {
      shopifyProductId: { in: ids },
      storeId,
    },
    select: PRODUCT_CARD_SELECT,
  });

  const productsById = new Map(
    products.map((product) => [product.shopifyProductId, product]),
  );

  return ids
    .map((id) => productsById.get(id))
    .filter(Boolean)
    .map((product) => ({ ...product, isRecommended: true }));
}
