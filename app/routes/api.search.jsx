import prisma from "../db.server.js";
import { aiSearch } from "../services/ai.service.js";
import { hydrateProducts } from "../services/recommendation.service.js";
import { buildFilterQuery } from "../services/filter.service.js";
import { buildSortingQuery } from "../services/sorting.service.js";

export const action = async ({ request }) => {
  try {
    const body = await request.json();

    const { shop, query, filters, sort } = body;

    // 🔹 1. Get Store
    const store = await prisma.store.findUnique({
      where: { shop },
    });

    if (!store) {
      return json({ error: "Store not found" }, { status: 404 });
    }

    // 🔹 2. Get Filter & Sorting Config (DB-driven)
    const [filterConfig, sortingConfig] = await Promise.all([
      prisma.filter.findMany({
        where: {
          storeId: store.id,
          status: "selected",
        },
      }),
      prisma.sorting.findMany({
        where: {
          storeId: store.id,
          isActive: true,
        },
      }),
    ]);

    // 🔹 3. Build Queries
    const filterQuery = buildFilterQuery(filterConfig,filters);
    const sortingQuery = buildSortingQuery(sortingConfig, sort);


    let products = [];

    // =========================================================
    // 🔥 4. AI SEARCH FLOW (PRIMARY)
    // =========================================================
    if (query && query.trim().length > 0) {
      try {
        const aiResults = await aiSearch(shop, {
          query_text: query,
          filters,
          limit: 10,
        });

        // 👉 Convert AI result → full product data
        products = await hydrateProducts(store.id, aiResults);
      } catch (err) {
        console.error("AI search failed → fallback to DB", err);

        // 🔁 fallback to DB search
        products = await prisma.product.findMany({
          where: {
            storeId: store.id,
            ...filterQuery,
          },
          orderBy: sortingQuery,
          take: 50,
        });

        return products;
      }

      // =========================================================
      // 🔥 5. APPLY FILTERS (IN-MEMORY after AI ranking)
      // =========================================================
      // if (filters && Object.keys(filters).length > 0) {
      //   products = products.filter((product) => {
      //     return filtersConfig.every((filter) => {
      //       const userValue = filters[filter.name];
      //       if (!userValue) return true;

      //       switch (filter.field) {
      //         case "tags":
      //           return product.tags?.some((tag) =>
      //             Array.isArray(userValue)
      //               ? userValue.includes(tag)
      //               : userValue === tag,
      //           );

      //         case "price":
      //           return product.price < parseFloat(userValue);

      //         default:
      //           return true;
      //       }
      //     });
      //   });
      // }

      // =========================================================
      // 🔥 6. APPLY SORTING (IN-MEMORY)
      // =========================================================
      if (sortingQuery) {
        const [field, order] = Object.entries(sortingQuery)[0];

        products.sort((a, b) => {
          if (order === "asc") return a[field] - b[field];
          return b[field] - a[field];
        });
      }

      return products.slice(0, 20);
    }

    // =========================================================
    // 🔥 7. NON-AI FLOW (PURE DB SEARCH)
    // =========================================================
    const dbProducts = await prisma.product.findMany({
      where: {
        storeId: store.id,
        ...filterQuery,
      },
      orderBy: sortingQuery,
      take: 20,
    });

    return dbProducts;
  } catch (error) {
    console.error("Search API Error:", error);
    return ({ error: "Internal Server Error" }, { status: 500 });
  }
};
