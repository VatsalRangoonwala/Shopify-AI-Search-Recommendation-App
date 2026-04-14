import prisma from "../db.server.js";
import { authenticate } from "../shopify.server.js";

export const action = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);
    const { filterIds = [] } = await request.json();

    if (!Array.isArray(filterIds) || filterIds.length === 0) {
      return Response.json(
        { success: false, error: "filterIds is required" },
        { status: 400 },
      );
    }

    const store = await prisma.store.findUnique({
      where: { shop: session.shop },
      select: { id: true },
    });

    if (!store) {
      return Response.json(
        { success: false, error: "Store not found" },
        { status: 404 },
      );
    }

    const existingFilters = await prisma.filter.findMany({
      where: { storeId: store.id },
      select: { id: true },
    });

    const validIds = new Set(existingFilters.map((f) => f.id));
    const selectedIds = filterIds.filter((id) => validIds.has(id));
    const unselectedIds = existingFilters
      .filter((f) => !selectedIds.includes(f.id))
      .map((f) => f.id);

    await prisma.$transaction([
      prisma.filter.updateMany({
        where: { storeId: store.id, id: { in: selectedIds } },
        data: { status: "selected", isVisible: true },
      }),
      prisma.filter.updateMany({
        where: { storeId: store.id, id: { in: unselectedIds } },
        data: { status: "detected", isVisible: false },
      }),
    ]);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Update Filter Error:", error);
    return Response.json(
      { success: false, error: "Something went wrong while updating filter" },
      { status: 500 },
    );
  }
};
