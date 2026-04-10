import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server.js";
import { seedSorting } from "./services/sorting.seed.js";

const appUrl = process.env.SHOPIFY_APP_URL || process.env.APP_URL || "";

async function runAdminGraphql(admin, query, variables = {}) {
  const response = await admin.graphql(query, { variables });
  const payload = await response.json();

  if (payload.errors?.length) {
    throw new Error(payload.errors.map(({ message }) => message).join(", "));
  }

  return payload.data;
}

function assertNoUserErrors(
  userErrors = [],
  context = "Shopify Admin GraphQL",
) {
  if (!userErrors.length) return;

  const message = userErrors
    .map(({ field, message: errorMessage }) =>
      field?.length ? `${field.join(".")}: ${errorMessage}` : errorMessage,
    )
    .join(", ");

  throw new Error(`${context} failed: ${message}`);
}

function isMissingWebPixelError(error) {
  return error?.message?.includes("No web pixel was found for this app.");
}

async function enableTrackingPixel(admin, shop) {
  const webPixel = {
    settings: JSON.stringify({
      shopDomain: shop,
      apiEndpoint: `${appUrl}/api/events`,
    }),
  };

  let data = { webPixel: null };

  try {
    data = await runAdminGraphql(
      admin,
      `#graphql
        query {
          webPixel {
            id
            settings
          }
        }
      `,
    );
  } catch (error) {
    if (!isMissingWebPixelError(error)) {
      throw error;
    }
  }

  if (data.webPixel?.id) {
    const updateData = await runAdminGraphql(
      admin,
      `#graphql
        mutation webPixelUpdate($id: ID!, $webPixel: WebPixelInput!) {
          webPixelUpdate(id: $id, webPixel: $webPixel) {
            webPixel {
              id
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      { id: data.webPixel.id, webPixel },
    );

    assertNoUserErrors(updateData.webPixelUpdate.userErrors, "webPixelUpdate");

    return updateData.webPixelUpdate.webPixel;
  }

  const createData = await runAdminGraphql(
    admin,
    `#graphql
      mutation WebPixelCreate($webPixel: WebPixelInput!) {
        webPixelCreate(webPixel: $webPixel) {
          webPixel {
            id
            settings
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    { webPixel },
  );

  assertNoUserErrors(createData.webPixelCreate.userErrors, "webPixelCreate");

  return createData.webPixelCreate.webPixel;
}

async function registerWebhookSubscription(admin, topic, callbackPath) {
  if (!appUrl) {
    throw new Error(
      "Missing SHOPIFY_APP_URL/APP_URL. Cannot register webhook subscriptions.",
    );
  }

  const data = await runAdminGraphql(
    admin,
    `#graphql
      mutation RegisterWebhook {
        webhookSubscriptionCreate(
          topic: ${topic}
          webhookSubscription: {
            callbackUrl: "${appUrl}${callbackPath}"
            format: JSON
          }
        ) {
          webhookSubscription {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
  );

  assertNoUserErrors(
    data.webhookSubscriptionCreate.userErrors,
    `webhookSubscriptionCreate(${topic})`,
  );

  return data.webhookSubscriptionCreate.webhookSubscription;
}

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl,
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  future: {
    expiringOfflineAccessTokens: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),

  hooks: {
    afterAuth: async ({ session, admin }) => {
      const { shop, accessToken } = session;

      // Save store
      await prisma.store.upsert({
        where: { shop },
        update: { accessToken },
        create: {
          shop,
          accessToken,
        },
      });

      await seedSorting(shop);
      try {
        await enableTrackingPixel(admin, shop);
        console.log(`Pixel enabled successfully for ${shop}`);
      } catch (error) {
        console.error(`⚠️ Failed to enable pixel for ${shop}:`, error.message);
        // App installation continues even if pixel fails
      }

      // Register Webhooks
      await registerWebhookSubscription(
        admin,
        "PRODUCTS_CREATE",
        "/webhooks/products/create",
      );
      await registerWebhookSubscription(
        admin,
        "PRODUCTS_UPDATE",
        "/webhooks/products/update",
      );
      await registerWebhookSubscription(
        admin,
        "PRODUCTS_DELETE",
        "/webhooks/products/delete",
      );
    },
  },
});

export default shopify;
export const apiVersion = ApiVersion.October25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
