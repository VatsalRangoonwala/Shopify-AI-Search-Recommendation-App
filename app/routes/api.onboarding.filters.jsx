import { authenticate } from "../shopify.server.js";
import {productSyncQueue} from '../queues/queue.js'

export const action = async ({ request }) => {
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
