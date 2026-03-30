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

  await productSyncQueue.add("webhook-product-create", {
    product: payload,
    shop,
  });

  return new Response("Queued");
};
