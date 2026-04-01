import prisma from "../db.server.js";

export async function hydrateProducts(storeId, aiResults) {
  const ids = aiResults.results.map(r => r.product_id.toString());

  const products = await prisma.product.findMany({
    where: {
      id: { in: ids },
      storeId,
    },
  });

  // Maintain AI ranking order
  const map = new Map(products.map(p => [p.id, p]));

  return ids
    .map(id => map.get(id))
    .filter(Boolean);
}