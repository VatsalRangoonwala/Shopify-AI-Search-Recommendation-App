import prisma from "../db.server.js";
import { buildFilterQuery } from "../services/filter.service.js";
import { PRODUCT_CARD_SELECT } from "../services/recommendation.service.js";

const DEFAULT_PER_PAGE = 12;
const MAX_PER_PAGE = 48;

function clampPageSize(value) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_PER_PAGE;
  }

  return Math.min(Math.floor(parsed), MAX_PER_PAGE);
}

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
        page: Number(page),
        perPage: clampPageSize(perPage),
        hasNextPage: false,
        hasPreviousPage: Number(page) > 1,
      };

    const filtersKey = Object.keys(filters);
    const hasFilters = filtersKey.length > 0;
    const hasSort = typeof sort === "string" && sort.trim().length > 0;

    let filterQuery = {};
    let sortingQuery = { createdAt: "desc" };

    if (hasFilters || hasSort) {
      const [filterConfig, sortingConfig] = await Promise.all([
        hasFilters
          ? prisma.filter.findMany({
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
            })
          : [],
        hasSort
          ? prisma.sorting.findFirst({
              where: {
                storeId: store.id,
                isActive: true,
                name: sort.trim().toLowerCase(),
              },
              select: {
                field: true,
                order: true,
              },
            })
          : null,
      ]);

      if (hasSort && sortingConfig) {
        sortingQuery = { [sortingConfig.field]: sortingConfig.order };
      }

      if (hasFilters) {
        filterQuery = buildFilterQuery(filterConfig, filters);
      }
    }

    const where = { storeId: store.id, ...filterQuery };
    if (Array.isArray(excludeIds) && excludeIds.length) {
      where.shopifyProductId = { notIn: excludeIds };
    }

    const pageNumber = Math.max(1, Number(page) || 1);
    const pageSize = clampPageSize(perPage);
    const skip = (pageNumber - 1) * pageSize;

    const rows = await prisma.product.findMany({
      where,
      orderBy: sortingQuery || { createdAt: "desc" },
      skip,
      take: pageSize + 1,
      select: PRODUCT_CARD_SELECT,
    });

    const hasNextPage = rows.length > pageSize;
    const products = hasNextPage ? rows.slice(0, pageSize) : rows;

    return {
      products,
      page: pageNumber,
      perPage: pageSize,
      hasNextPage,
      hasPreviousPage: pageNumber > 1,
    };
  } catch (err) {
    console.error("Products API Error:", err);
    return {
      products: [],
      page: 1,
      perPage: DEFAULT_PER_PAGE,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }
};
