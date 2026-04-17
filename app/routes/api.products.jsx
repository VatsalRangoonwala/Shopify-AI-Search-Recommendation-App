import prisma from "../db.server.js";
import { buildFilterQuery } from "../services/filter.service.js";

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

    const store = await prisma.store.findUnique({
      where: { shop },
      select: { id: true },
    });

    if (!store)
      return {
        products: [],
        total: 0,
        page: Number(page),
        perPage: Number(perPage),
      };

    const filtersKey = Object.keys(filters);
    const hasFilters = filtersKey.length > 0;
    const hasSort = typeof sort === "string" && sort.trim().length > 0;

    let filterQuery = {};
    let sortingQuery = { createdAt: "desc" };

    if (hasFilters || hasSort) {
      const [filterConfig, sortingConfig] = await prisma.$transaction([
        prisma.filter.findMany({
          where: {
            storeId: store.id,
            status: "selected",
            key: { in: filtersKey ?? [] },
          },
          select: {
            key: true,
            source: true,
            sourceField: true,
          },
        }),
        prisma.sorting.find({
          where: {
            storeId: store.id,
            isActive: true,
            name: sort.trim().toLowerCase(),
          },
          select: {
            field: true,
            order: true,
          },
        }),
      ]);

      if (sort.length > 0)
        if (sortingConfig)
          sortingQuery = { [sortingConfig.field]: sortingConfig.order };
      if (filtersKey.length > 0)
        filterQuery = buildFilterQuery(filterConfig, filters);
    }

    const where = { storeId: store.id, ...filterQuery };
    if (Array.isArray(excludeIds) && excludeIds.length) {
      where.shopifyProductId = { notIn: excludeIds };
    }

    const productCardSelect = {
      id: true,
      shopifyProductId: true,
      handle: true,
      title: true,
      vendor: true,
      featuredImage: true,
      maxPrice: true,
      compareAtMaxPrice: true,
      variants: true,
    };

    if (page == 1) {
      perPage = 12;
    }

    const skip = (Number(page) - 1) * Number(perPage);

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy: sortingQuery || { createdAt: "desc" },
        skip,
        take: Number(perPage),
        select: productCardSelect,
      }),
      prisma.product.count({ where }),
    ]);

    return { products, total, page: Number(page), perPage: Number(perPage) };
  } catch (err) {
    console.error("Products API Error:", err);
    return { products: [], total: 0, page: 1, perPage: 12 };
  }
};
