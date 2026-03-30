import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.October25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
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

      // Register Webhooks
      await admin.graphql(`
      mutation {
        webhookSubscriptionCreate(
          topic: PRODUCTS_CREATE
          webhookSubscription: {
            callbackUrl: "${process.env.APP_URL}/webhooks/products/create"
            format: JSON
          }
        ) {
          userErrors {
            field
            message
          }
        }
      }
    `);

      await admin.graphql(`
      mutation {
        webhookSubscriptionCreate(
          topic: PRODUCTS_UPDATE
          webhookSubscription: {
            callbackUrl: "${process.env.APP_URL}/webhooks/products/update"
            format: JSON
          }
        ) {
          userErrors {
            field
            message
          }
        }
      }
    `);

      await admin.graphql(`
      mutation {
        webhookSubscriptionCreate(
          topic: PRODUCTS_DELETE
          webhookSubscription: {
            callbackUrl: "${process.env.APP_URL}/webhooks/products/delete"
            format: JSON
          }
        ) {
          userErrors {
            field
            message
          }
        }
      }
    `);
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
