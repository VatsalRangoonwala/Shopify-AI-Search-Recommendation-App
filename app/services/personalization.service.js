import prisma from "../db.server.js";

export async function getUserBehavior(storeId, sessionId, customerId = null) {
  const [cart, viewed, purchased] = await Promise.all([
    prisma.event.findMany({
      where: {
        storeId,
        OR: [{ sessionId }, ...(customerId ? [{ customerId }] : [])],
        type: "add_to_cart",
      },
      orderBy: { timestamp: "desc" },
      take: 10,
      select: {
        productId: true,
      },
    }),

    prisma.event.findMany({
      where: {
        storeId,
        OR: [{ sessionId }, ...(customerId ? [{ customerId }] : [])],
        type: "view",
      },
      orderBy: { timestamp: "desc" },
      take: 10,
      select: {
        productId: true,
      },
    }),

    prisma.event.findMany({
      where: {
        storeId,
        OR: [{ sessionId }, ...(customerId ? [{ customerId }] : [])],
        type: "purchase",
      },
      orderBy: { timestamp: "desc" },
      take: 10,
      select: {
        productId: true,
      },
    }),
  ]);

  return {
    cart: cart.map((e) => e.productId).filter(Boolean),
    viewed: viewed.map((e) => e.productId).filter(Boolean),
    purchased: purchased.map((e) => e.productId).filter(Boolean),
  };
}
