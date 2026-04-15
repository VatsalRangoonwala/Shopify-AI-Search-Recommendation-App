import { normalizeWebhookProduct } from "../services/product.service.js";
import { productSyncQueue } from "../queues/queue.js";
import { verifyWebhook } from "../utils/webhook.js";

export const action = async ({ request }) => {
  const rawBody = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256");

  if (!verifyWebhook(rawBody, hmac)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  //   const payload = await request.json();

  const shop = request.headers.get("x-shopify-shop-domain");

  await productSyncQueue.add("webhook-product-update", {
    product: payload,
    shop,
  });
  const normalized = normalizeWebhookProduct(payload);
  await productSyncQueue.add("ai-sync", {
    aiRes: [
      {
        product_id: normalized.shopifyProductId,
        title: normalized.title,
        description: normalized?.description ?? "",
        brand: normalized?.vendor ?? "",
        category: normalized?.productType ?? "",
        tags: normalized.tags ?? [],
        metadata: { price: parseFloat(normalized.maxPrice) },
      },
    ],
    shop,
  });

  return new Response("Queued");
};
