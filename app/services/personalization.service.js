import prisma from "../db.server.js";

export async function getUserBehavior(storeId, sessionId, customerId = null) {
  const events = await prisma.event.findMany({
    where: {
      storeId,
      OR: [
        { sessionId },
        ...(customerId ? [{ customerId }] : []),
      ],
    },
    orderBy: {
      timestamp: "desc",
    },
    take: 200, // more context
  });  

  const viewed = new Map();
  const cart = new Map();
  const purchased = new Map();

  for (const e of events) {
    const id = e.productId;

    if (e.type === "view") {
      viewed.set(id, (viewed.get(id) || 0) + 1);
    }

    if (e.type === "add_to_cart") {
      cart.set(id, (cart.get(id) || 0) + 1);
    }

    if (e.type === "purchase") {
      purchased.set(id, (purchased.get(id) || 0) + 1);
    }
  }

  // 🔥 Convert to ranked arrays
  const sortByWeight = (map) =>
    [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

  return {
    viewed: sortByWeight(viewed),
    cart: sortByWeight(cart),
    purchased: sortByWeight(purchased),
  };
}