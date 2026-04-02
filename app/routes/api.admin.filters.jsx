import prisma from "../db.server.js";
import { authenticate } from "../shopify.server.js";

const ALLOWED_STATUS = ["detected", "selected", "disabled"];
const ALLOWED_UI_TYPES = ["checkbox", "dropdown", "swatch", "slider"];

export const action = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const body = await request.json();

    const { filterId, label, status, uiType } = body;

    if (!filterId) {
      return jsonError("filterId is required", 400);
    }

    if (status && !ALLOWED_STATUS.includes(status)) {
      return jsonError("Invalid status value", 400);
    }

    if (uiType && !ALLOWED_UI_TYPES.includes(uiType)) {
      return jsonError("Invalid uiType value", 400);
    }

    if (label !== undefined && typeof label !== "string") {
      return jsonError("label must be a string", 400);
    }

    const store = await prisma.store.findUnique({
      where: { shop: session.shop },
      select: { id: true },
    });

    if (!store) {
      return jsonError("Store not found", 404);
    }

    const existingFilter = await prisma.filter.findFirst({
      where: {
        id: filterId,
        storeId: store.id,
      },
      include: {
        values: {
          orderBy: { productCount: "desc" },
        },
      },
    });

    if (!existingFilter) {
      return jsonError("Filter not found", 404);
    }

    const updatedFilter = await prisma.filter.update({
      where: { id: filterId },
      data: {
        ...(label !== undefined ? { label: label.trim() } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(uiType !== undefined ? { uiType } : {}),
      },
      include: {
        values: {
          orderBy: { productCount: "desc" },
        },
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        filter: formatFilterResponse(updatedFilter),
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

function formatFilterResponse(filter) {
  return {
    id: filter.id,
    key: filter.key,
    label: filter.label,
    status: filter.status,
    uiType: filter.uiType,
    isVisible: filter.isVisible,
    position: filter.position,
    uniqueCount: filter.uniqueCount,
    productCount: filter.productCount,
    values: filter.values.map((v) => ({
      id: v.id,
      value: v.value,
      count: v.productCount,
    })),
  };
}

function jsonError(message, status = 400) {
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
    include: {
      values: {
        orderBy: { productCount: "desc" },
      },
    },
    orderBy: [{ label: "asc" }],
  });

  const arr = filters.map((filter) => ({
    id: filter.id,
    key: filter.key,
    label: filter.label,
    status: filter.status,
    uiType: filter.uiType,
    source: filter.source,
    productCount: filter.productCount,
    uniqueCount: filter.uniqueCount,
    values: filter.values.map((v) => ({
      id: v.id,
      value: v.value,
      count: v.productCount,
    })),
  }));
  return { arr };
};
