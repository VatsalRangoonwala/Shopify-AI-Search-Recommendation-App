import prisma from "../db.server.js";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  const store = await prisma.store.findUnique({
    where: { shop },
  });

  if (!store) return json([]);

  const filters = await prisma.filter.findMany({
    where: {
      storeId: store.id,
      status:"selected"
    },
    orderBy: { position: "asc" },
  });

  return filters;
};
