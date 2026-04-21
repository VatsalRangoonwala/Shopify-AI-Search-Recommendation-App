import { authenticate } from "../shopify.server.js";
import { productSyncQueue } from "../queues/queue.js";
import prisma from "../db.server.js";
import { fetchProductType } from "../services/product.service.js";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const store = await prisma.store.findUnique({
    where: { shop: session.shop },
  });

  if (!store) return { success: false };

  const allType = await fetchProductType(admin);

  await productSyncQueue.add("clean-productType", {
    storeId: store.id,
    allType,
    shop: store.shop,
  });

  return { success: true };
};
