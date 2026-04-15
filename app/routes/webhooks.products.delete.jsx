import { verifyWebhook } from "../utils/webhook.js";
import { productSyncQueue } from "../queues/queue.js";

export const action = async ({ request }) => {
  const rawBody = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256");

  if (!verifyWebhook(rawBody, hmac)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  //   const payload = await request.json();
  const shop = request.headers.get("x-shopify-shop-domain");

  await productSyncQueue.add("webhook-product-delete", {
    productId: payload.id,
    shop,
  });

  await fetch(
    `${process.env.AI_BASE_URL}/sync/${shop}/products/${payload.id}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    },
  ).catch((err) => console.log(err));

  return new Response("Queued");
};
