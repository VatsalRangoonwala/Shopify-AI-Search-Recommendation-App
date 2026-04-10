import { register } from "@shopify/web-pixels-extension";

const CUSTOM_EVENT_TYPES = {
  ai_add_to_cart: "add_to_cart",
  ai_product_view: "view",
  ai_recommendation_click: "recommendation_click",
  ai_recommendation_view: "recommendation_view",
  ai_search: "search",
};

function getFromPaths(source, paths) {
  for (const path of paths) {
    const segments = path.split(".");
    let value = source;

    for (const segment of segments) {
      if (value == null) {
        value = undefined;
        break;
      }

      value = value[segment];
    }

    if (value != null && value !== "") {
      return value;
    }
  }

  return null;
}

function normalizeId(value) {
  if (value == null || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    const trimmedValue = value.trim();
    const gidMatch = trimmedValue.match(/\/(\d+)(?:\?.*)?$/);
    return gidMatch ? gidMatch[1] : trimmedValue;
  }

  if (typeof value === "object") {
    return normalizeId(
      value.id ?? value.productId ?? value.handle ?? value.query,
    );
  }

  return String(value);
}

function getProductId(event) {
  return normalizeId(
    getFromPaths(event, [
      "data.productVariant.product.id",
      "data.productVariant.id",
      "data.product.id",
      "data.cartLine.merchandise.product.id",
      "data.cartLine.merchandise.id",
      "customData.productId",
      "data.customData.productId",
      "data.productId",
    ]),
  );
}

function getSearchQuery(event) {
  return normalizeId(
    getFromPaths(event, [
      "data.searchResult.query",
      "data.searchResult.searchTerm",
      "data.searchResult.term",
      "data.query",
      "data.searchTerm",
      "customData.query",
      "data.customData.query",
    ]),
  );
}

register(({ analytics, settings, browser }) => {
  async function getOrCreateSessionId() {
    let sessionId = await browser.localStorage.getItem("ai_session_id");
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      await browser.localStorage.setItem("ai_session_id", sessionId);
    }
    return sessionId;
  }
  const endpoint = settings.apiEndpoint;
  const shop = settings.shopDomain;

  async function sendEvent({ type, productId }) {
    if (!endpoint || !shop || !type || !productId) {
      return;
    }

    const sessionId = await getOrCreateSessionId();
    try {
      await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          type,
          productId,
          sessionId,
          shop,
        }),
        keepalive: true,
        mode: "cors",
      });
    } catch (error) {
      console.error("AI tracking pixel failed to send event", error);
    }
  }

  analytics.subscribe("product_viewed", async (event) => {
    await sendEvent({
      type: "view",
      productId: getProductId(event),
    });
  });

  analytics.subscribe("product_added_to_cart", async (event) => {
    await sendEvent({
      type: "add_to_cart",
      productId: getProductId(event),
    });
  });
  analytics.subscribe("checkout_completed", async (event) => {
    const lineItems = event.data.checkout.lineItems;
    for (const item of lineItems) {
      if (!item?.variant?.product?.id) continue;

      await sendEvent({
        type: "purchase",
        productId: item.variant.product.id,
      });
    }
  });

  analytics.subscribe("search_submitted", async (event) => {
    await sendEvent({
      type: "search",
      productId: getSearchQuery(event),
    });
  });

  Object.entries(CUSTOM_EVENT_TYPES).forEach(([eventName, type]) => {
    analytics.subscribe(eventName, async (event) => {
      const productId =
        type === "search" ? getSearchQuery(event) : getProductId(event);

      await sendEvent({
        type,
        productId,
      });
    });
  });
});
