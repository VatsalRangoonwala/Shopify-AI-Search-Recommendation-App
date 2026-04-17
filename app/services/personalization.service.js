import prisma from "../db.server.js";

export async function getUserBehavior(storeId, sessionId, customerId = null) {
  const [cart, viewed, wishlist] = await Promise.all([
    prisma.event.findMany({
      where: {
        storeId,
        OR: [{ sessionId }, ...(customerId ? [{ customerId }] : [])],
        type: "add_to_cart",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        product: { select: { productId: true } },
      },
    }),

    prisma.event.findMany({
      where: {
        storeId,
        OR: [{ sessionId }, ...(customerId ? [{ customerId }] : [])],
        type: "view",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        product: { select: { productId: true } },
      },
    }),

    prisma.event.findMany({
      where: {
        storeId,
        OR: [{ sessionId }, ...(customerId ? [{ customerId }] : [])],
        type: "purchase",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        product: { select: { productId: true } },
      },
    }),
  ]);

  return {
    cart: cart.map((e) => e.product?.productId).filter(Boolean),
    viewed: viewed.map((e) => e.product?.productId).filter(Boolean),
    wishlist: wishlist.map((e) => e.product?.productId).filter(Boolean),
  };
}
