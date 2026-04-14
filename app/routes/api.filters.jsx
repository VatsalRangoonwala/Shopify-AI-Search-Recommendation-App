import prisma from "../db.server.js";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return Response.json({ error: "shop is required" }, { status: 400 });
  }

  const store = await prisma.store.findUnique({
    where: { shop },
    select: { id: true },
  });

  if (!store) return Response.json([], { status: 404 });

  const filters = await prisma.filter.findMany({
    where: {
      storeId: store.id,
      status: "selected",
      isVisible: true,
    },
    orderBy: { position: "asc" },
  });

  return Response.json(filters);
};
