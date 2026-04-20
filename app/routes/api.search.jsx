import prisma from "../db.server.js";
import { aiSearch } from "../services/ai.service.js";
import {
  hydrateProducts,
  PRODUCT_CARD_SELECT,
} from "../services/recommendation.service.js";

export const action = async ({ request }) => {
  try {
    const body = await request.json();
    const { shop, query, filters = {} } = body;

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
            limit: 48,
            diversity_penalty: store.diversity,
          },
          { signal: request.signal },
        );

        products = await hydrateProducts(store.id, aiResults);
        return products;
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
    }
  } catch (error) {
    console.error("Search API Error:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
};
