import prisma from "../db.server.js";
import { seedSorting, defaultSorting } from "./sorting.seed.js";

export async function resetSettings(shop) {
  const store = await prisma.store.findUnique({ where: { shop } });
  if (!store) throw new Error("Store not found");

  // Ensure default sorting rows exist
  await seedSorting(shop);

  const storeId = store.id;

  // Reset basic store-level settings and visible states
  await prisma.$transaction([
    prisma.store.update({
      where: { id: storeId },
      data: { isOnboarding: true, diversity: 0 },
    }),
    prisma.filter.updateMany({
      where: { storeId },
      data: { status: "detected", isVisible: true },
    }),
    prisma.sorting.updateMany({
      where: { storeId },
      data: { isActive: true },
    }),
  ]);

  // Make sure sorting rows match the default ordering and metadata
  for (const s of defaultSorting) {
    await prisma.sorting.updateMany({
      where: { storeId, name: s.name },
      data: {
        position: s.position,
        label: s.label,
        field: s.field,
        order: s.order,
        isActive: true,
      },
    });
  }

  return true;
}

export async function deleteAllData(shop) {
  const store = await prisma.store.findUnique({ where: { shop } });
  if (!store) throw new Error("Store not found");

  const storeId = store.id;

  // Remove application data while keeping the Store row
  await prisma.$transaction([
    prisma.product.deleteMany({ where: { storeId } }),
    prisma.filter.deleteMany({ where: { storeId } }),
    prisma.sorting.deleteMany({ where: { storeId } }),
    prisma.event.deleteMany({ where: { storeId } }),
    prisma.syncJob.deleteMany({ where: { storeId } }),
  ]);

  return true;
}
