import { productSyncQueue } from "../queues/queue.js";

export const action = async ({ request }) => {
  const body = await request.json();

  const { type, productId, sessionId, shop } = body;

  await productSyncQueue
  .add("track-event", {
    type,
    productId,
    sessionId,
    shop,
  });

  return { success: true };
};
