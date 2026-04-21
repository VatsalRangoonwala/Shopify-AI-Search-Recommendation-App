import { authenticate } from "../shopify.server.js";
import prisma from "../db.server.js";
import { fetchProductsBatch } from "../services/product.service.js";
import { productSyncQueue } from "../queues/queue.js";
import { normalizeAIProduct } from "../services/ai.service.js";

export const action = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const store = await prisma.store.findUnique({
    where: { shop: session.shop },
  });

  // Create Sync Job
  const job = await prisma.syncJob.create({
    data: {
      storeId: store.id,
      status: "running",
    },
  });

  const normaliedProductType = await prisma.normalizedValue.findUnique({
    where: {
      storeId: store.id,
    },
    select:{
      productType:true
    }
  });

  let cursor = null;
  let total = 0;

  do {
    const { products, nextCursor, hasNextPage } = await fetchProductsBatch(
      admin,
      cursor,
      normaliedProductType
    );

    total += products.length;

    const aiRes = [];
    for (const product of products) {
      aiRes.push(normalizeAIProduct(product));
      await productSyncQueue.add("product-sync", {
        product,
        shop: session.shop,
        syncJobId: job.id,
      });
    }

    await productSyncQueue.add("ai-sync", {
      aiRes,
      shop: session.shop,
    });

    cursor = nextCursor;

    // Update total count
    await prisma.syncJob.update({
      where: { id: job.id },
      data: { totalProducts: total },
    });

    if (!hasNextPage) break;
  } while (true);

  return { success: true, jobId: job.id };
};
