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

  const sorting = await prisma.sorting.findMany({
    where: { storeId: store.id, isActive: true },
    orderBy: { position: "asc" },
    select: { name: true, label: true },
  });

  return Response.json(sorting);
};
