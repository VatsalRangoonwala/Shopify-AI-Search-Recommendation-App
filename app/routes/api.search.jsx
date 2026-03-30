import prisma from "../db.server.js";
import { buildFilterQuery } from "../services/filter.service.js";
import { buildSortingQuery } from "../services/sorting.service.js";

export const action = async ({ request }) => {
  const body = await request.json();

  const { shop, filters, sort } = body;

  const store = await prisma.store.findUnique({
    where: { shop },
  });

  if (!store) return json([]);

  // 🔥 Get config from DB
  const filtersConfig = await prisma.filter.findMany({
    where: { storeId: store.id, isActive: true },
  });

  const sortingConfig = await prisma.sorting.findMany({
    where: { storeId: store.id, isActive: true },
  });

  // 🔥 Build dynamic query
  const filterQuery = buildFilterQuery(filtersConfig, filters);
  const sortingQuery = buildSortingQuery(sortingConfig, sort);

  const products = await prisma.product.findMany({
    where: {
      storeId: store.id,
      ...filterQuery,
    },
    orderBy: sortingQuery,
    take: 20,
  });

  return products;
};