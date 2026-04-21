import { authenticate } from "../shopify.server.js";
import { productSyncQueue } from "../queues/queue.js";
import prisma from "../db.server.js";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const store = await prisma.store.findUnique({
    where: { shop: session.shop },
    select: { id: true },
  });

  if (!store) return { success: false };

  await productSyncQueue.add("clean-productType", {
    storeId:store.id,
    admin
  });

  return {success:true}
};
