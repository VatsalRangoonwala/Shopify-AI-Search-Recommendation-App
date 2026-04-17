import prisma from "../db.server.js";

export const defaultSorting = [
  {
    name: "id_asc",
    label: "Featured",
    field: "id",
    order: "asc",
    position: 1,
  },
  {
    name: "price_asc",
    label: "Price: Low to High",
    field: "maxPrice",
    order: "asc",
    position: 2,
  },
  {
    name: "price_desc",
    label: "Price: High to Low",
    field: "maxPrice",
    order: "desc",
    position: 3,
  },
  {
    name: "created_at_desc",
    label: "Newest",
    field: "createdAt",
    order: "desc",
    position: 4,
  },
  {
    name: "title_asc",
    label: "A-Z",
    field: "title",
    order: "asc",
    position: 5,
  },
  {
    name: "title_desc",
    label: "Z-A",
    field: "title",
    order: "desc",
    position: 6,
  },
];

export async function seedSorting(shop) {
  const store = await prisma.store.findUnique({ where: { shop } });
  const existing = await prisma.sorting.findMany({
    where: { storeId: store.id },
  });

  if (existing.length > 0) return;

  for (const s of defaultSorting) {
    await prisma.sorting.create({
      data: {
        ...s,
        storeId: store.id,
        isActive: true,
      },
    });
  }
}
