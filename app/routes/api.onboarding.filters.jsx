import { authenticate } from "../shopify.server.js";
import { productSyncQueue } from "../queues/queue.js";
import { jsonError } from "./api.admin.filters.jsx";

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);

    await productSyncQueue.add("filter-sync", {
      shop: session.shop,
    });
  } catch (error) {
    console.error("Update Filter Error:", error);
    return jsonError("Something went wrong while updating filter", 500);
  }
};
