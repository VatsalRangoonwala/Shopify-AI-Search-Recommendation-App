import { productQueue } from "../queues/queue.js";
import { verifyWebhook } from "../utils/webhook.js";

export const action = async ({ request }) => {
  const rawBody = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256");

  if (!verifyWebhook(rawBody, hmac)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const shop = request.headers.get("x-shopify-shop-domain");

  for (const item of payload.line_items) {
    await productQueue.add("track-event", {
      type: "purchase",
      productId: item.product_id,
      shop,
    });
  }

  return new Response("OK");
};