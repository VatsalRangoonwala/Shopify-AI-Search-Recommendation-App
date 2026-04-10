import { productSyncQueue } from "../queues/queue.js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

function jsonResponse(payload, init = {}) {
  return new Response(JSON.stringify(payload), {
    ...init,
    headers: {
      ...corsHeaders,
      ...(init.headers || {}),
    },
  });
}

export const loader = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  return jsonResponse({ error: "Method not allowed" }, { status: 405 });
};

export const action = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const rawBody = await request.text();
    const body = rawBody ? JSON.parse(rawBody) : {};

    const { type, productId, sessionId, shop } = body;

    if (!type || !productId || !shop) {
      return jsonResponse(
        { success: false, error: "Missing required tracking fields" },
        { status: 400 },
      );
    }

    await productSyncQueue.add("track-event", {
      type,
      productId,
      sessionId,
      shop,
    });

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Event tracking API error:", error);
    return jsonResponse(
      { success: false, error: "Failed to track event" },
      { status: 500 },
    );
  }
};
