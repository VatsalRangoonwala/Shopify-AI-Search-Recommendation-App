import { authenticate } from "../shopify.server.js";
import { productSyncQueue } from "../queues/queue.js";

export const loader = async ({ request }) => {
  try {
    const { session } = await authenticate.admin(request);

    await productSyncQueue.add("filter-sync", {
      shop: session.shop,
    });

    return { success: true };
  } catch (error) {
    console.error("Update Filter Error:", error);
    return Response.json(
      { success: false, error: "Something went wrong while updating filter" },
      { status: 500 },
    );
  }
};
