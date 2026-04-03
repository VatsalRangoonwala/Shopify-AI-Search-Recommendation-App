import prisma from "../db.server.js";
import { authenticate } from "../shopify.server.js";

const ALLOWED_STATUS = ["detected", "selected", "disabled"];
const ALLOWED_UI_TYPES = ["checkbox", "dropdown", "swatch", "slider"];

export const action = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const body = await request.json();

    const { filterIds } = body;

    if (!filterIds || filterIds.length === 0) {
      return jsonError("filters are required", 400);
    }

    const store = await prisma.store.findUnique({
      where: { shop: session.shop },
      select: { id: true },
    });

    if (!store) {
      return jsonError("Store not found", 404);
    }

    const existingFilter = await prisma.filter.findMany({
      where: {
        storeId: store.id,
        id: {
          in: filterIds,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingFilter.length == 0) {
      return jsonError("Filters not found", 404);
    }

    const updatedFilter = await prisma.filter.updateMany({
      where: { id: { in: filterIds } },
      data: {
        status: "selected",
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Update Filter Error:", error);
    return jsonError("Something went wrong while updating filter", 500);
  }
};

// function formatFilterResponse(filter) {
//   return {
//     id: filter.id,
//     key: filter.key,
//     label: filter.label,
//     status: filter.status,
//     uiType: filter.uiType,
//     isVisible: filter.isVisible,
//     position: filter.position,
//     uniqueCount: filter.uniqueCount,
//     productCount: filter.productCount,
//     values: filter.values.map((v) => ({
//       id: v.id,
//       value: v.value,
//       count: v.productCount,
//     })),
//   };
// }

export function jsonError(message, status = 400) {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  const store = await prisma.store.findUnique({
    where: { shop: session.shop },
  });

  const filters = await prisma.filter.findMany({
    where: { storeId: store.id },
    orderBy: [{ label: "asc" }],
  });

  return { filters };
};
