import prisma from "../db.server.js";
import { buildFilterQuery } from "../services/filter.service.js";
import { buildSortingQuery } from "../services/sorting.service.js";

export const action = async ({ request }) => {
  try {
    const body = await request.json();
    let {
      shop,
      page = 1,
      perPage = 24,
      excludeIds = [],
      filters = {},
      sort,
    } = body;

    const store = await prisma.store.findUnique({ where: { shop } });
    if (!store)
      return {
        products: [],
        total: 0,
        page: Number(page),
        perPage: Number(perPage),
      };

    const [filterConfig, sortingConfig] = await Promise.all([
      prisma.filter.findMany({
        where: { storeId: store.id, status: "selected" },
      }),
      prisma.sorting.findMany({ where: { storeId: store.id, isActive: true } }),
    ]);

    const filterQuery = buildFilterQuery(filterConfig, filters || {});
    const sortingQuery = buildSortingQuery(sortingConfig || [], sort);

    const where = { storeId: store.id, ...filterQuery };
    if (Array.isArray(excludeIds) && excludeIds.length) {
      where.shopifyProductId = { notIn: excludeIds };
    }

    const total = await prisma.product.count({ where });
    if (page == 1) {
      perPage = 12;
    }

    const skip = (Number(page) - 1) * Number(perPage);

    const products = await prisma.product.findMany({
      where,
      orderBy: sortingQuery || { createdAt: "desc" },
      skip,
      take: Number(perPage),
    });

    return { products, total, page: Number(page), perPage: Number(perPage) };
  } catch (err) {
    console.error("Products API Error:", err);
    return { products: [], total: 0, page: 1, perPage: 12 };
  }
};
