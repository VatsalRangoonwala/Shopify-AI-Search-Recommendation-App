import prisma from "../db.server.js";
import { aiSearch, aiRecommend } from "../services/ai.service.js";
import {
  hydrateProducts,
  PRODUCT_CARD_SELECT,
} from "../services/recommendation.service.js";
// import { buildFilterQuery } from "../services/filter.service.js";
// import { buildSortingQuery } from "../services/sorting.service.js";
import { getUserBehavior } from "../services/personalization.service.js";

export const action = async ({ request }) => {
  try {
    const body = await request.json();
    const { shop, query, filters = {}, sessionId } = body;

    // 🔹 1. Get Store
    const store = await prisma.store.findUnique({
      where: { shop },
      select: {
        id: true,
        diversity: true,
      },
    });

    if (!store) {
      return Response.json({ error: "Store not found" }, { status: 404 });
    }

    // 🔹 2. Get Configs
    // const [filterConfig, sortingConfig] = await Promise.all([
    //   prisma.filter.findMany({
    //     where: {
    //       storeId: store.id,
    //       status: "selected",
    //     },
    //   }),
    //   prisma.sorting.findMany({
    //     where: {
    //       storeId: store.id,
    //       isActive: true,
    //     },
    //   }),
    // ]);

    // const filterQuery = buildFilterQuery(filterConfig, filters);
    // const sortingQuery = buildSortingQuery(sortingConfig, sort);

    let products = [];
    const normalizedFilters = { ...filters };

    // =========================================================
    // 🔥 3. SEARCH FLOW (when query exists)
    // =========================================================
    if (query && query.trim().length > 0) {
      try {
        // normalize price filter
        if (Array.isArray(filters.price)) {
          const price = filters.price.map((p) => parseFloat(p) + 0.0000001);
          normalizedFilters.price = { min: price[0], max: price[1] };
        }

        const aiResults = await aiSearch(
          shop,
          {
            query_text: query,
            filters: normalizedFilters,
            limit: 12,
            diversity_penalty: store.diversity,
          },
          { signal: request.signal },
        );

        products = await hydrateProducts(store.id, aiResults);
      } catch (err) {
        console.error("AI search failed → fallback to DB", err);

        return await prisma.product.findMany({
          where: {
            storeId: store.id,
          },
          orderBy: { createdAt: "desc" },
          take: 12,
          select: PRODUCT_CARD_SELECT,
        });
      }

      // 🔹 Sorting (in-memory)
      // if (sortingQuery && products.length) {
      //   const [field, order] = Object.entries(sortingQuery)[0];

      //   products.sort((a, b) => {
      //     if (order === "asc") return a[field] - b[field];
      //     return b[field] - a[field];
      //   });
      // }

      return products;
    }

    // =========================================================
    // 🔥 4. RECOMMENDATION FLOW (when NO query)
    // =========================================================
    try {
      const behavior = await getUserBehavior(store.id, sessionId);

      const aiResults = await aiRecommend(
        shop,
        {
          viewed_ids: behavior.viewed.slice(0, 10),
          added_to_cart_ids: behavior.cart.slice(0, 10),
          purchased_ids: behavior.purchased.slice(0, 10),
          filters: normalizedFilters,
          limit: 12,
          diversity_penalty: store.diversity,
        },
        { signal: request.signal },
      );

      products = await hydrateProducts(store.id, aiResults);

      if (products.length) {
        return products;
      }
    } catch (err) {
      console.error("AI recommend failed → fallback", err);
    }

    // =========================================================
    // 🔥 5. FINAL FALLBACK (DB latest products)
    // =========================================================
    return await prisma.product.findMany({
      where: { storeId: store.id },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: PRODUCT_CARD_SELECT,
    });
  } catch (error) {
    console.error("Search API Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
