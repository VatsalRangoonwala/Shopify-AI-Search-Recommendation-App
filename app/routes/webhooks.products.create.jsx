import { normalizeWebhookProduct } from "../services/product.service.js";
import { productSyncQueue } from "../queues/queue.js";
import { verifyWebhook } from "../utils/webhook.js";
import { normalizeAIProduct } from "../services/ai.service.js";
import prisma from "../db.server.js";

export const action = async ({ request }) => {
  const rawBody = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256");

  if (!verifyWebhook(rawBody, hmac)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  //   const payload = await request.json();

  const shop = request.headers.get("x-shopify-shop-domain");
  const store = await prisma.store.findUnique({
    where: {
      shop,
    },
    select: {
      id: true,
    },
  });  

  const normaliedProductType = await prisma.normalizedValue.findUnique({
    where: {
      storeId: store.id,
    },
    select: {
      productType: true,
    },
  });


  const normalized = normalizeWebhookProduct(
    payload,
    normaliedProductType.productType,
  );
  await productSyncQueue.add("webhook-product-create", {
    product: normalized,
    shop,
  });

  await productSyncQueue.add("ai-sync", {
    aiRes: [normalizeAIProduct(normalized)],
    shop,
  });

  return new Response("Queued");
};
