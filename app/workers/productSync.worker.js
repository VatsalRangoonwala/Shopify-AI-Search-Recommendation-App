import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import prisma from "../db.server.js";
import {
  addProductToFilters,
  generateStoreFilters,
  removeProductFromFilters,
  updateFiltersForProductChange,
} from "../services/filter.service.js";
import { normalizeWebhookProduct } from "../services/product.service.js";

const worker = new Worker(
  "product-sync",
  async (job) => {
    const { shop } = job.data;

    const store = await prisma.store.findUnique({
      where: { shop },
    });

    if (!store) return;

    // 🔥 HANDLE DIFFERENT JOB TYPES

    switch (job.name) {
      case "product-sync": {
        const { product, syncJobId } = job.data;

        await prisma.product.upsert({
          where: {
            // This matches the @@unique([storeId, shopifyProductId]) in your schema
            storeId_shopifyProductId: {
              storeId: store.id, // Ensure this variable is not undefined
              shopifyProductId: product.shopifyProductId, // Ensure this variable is not undefined
            },
          },
          update: product,
          create: {
            ...product,
            storeId: store.id,
          },
        });

        // update progress
        if (syncJobId) {
          await prisma.syncJob.update({
            where: { id: syncJobId },
            data: {
              processed: { increment: 1 },
            },
          });
        }

        break;
      }

      case "ai-sync": {
        const { aiRes, shop } = job.data;

        await fetch(`${process.env.AI_BASE_URL}/sync/${shop}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(aiRes),
        }).catch((err) => console.log(err));
        break;
      }

      case "filter-sync": {
        const { shop } = job.data;
        const store = await prisma.store.findUnique({
          where: { shop },
        });

        if (!store) return;
        await generateStoreFilters(store.id);

        break;
      }

      case "track-event": {
        const { type, productId, sessionId, shop } = job.data;

        const store = await prisma.store.findUnique({
          where: { shop },
        });

        if (!store) return;

        await prisma.event.create({
          data: {
            storeId: store.id,
            sessionId,
            type,
            productId: productId.toString(),
          },
        });

        break;
      }

      case "webhook-product-create": {
        const normalized = normalizeWebhookProduct(job.data.product);

        const existing = await prisma.product.findUnique({
          where: {
            storeId_shopifyProductId: {
              storeId: store.id,
              shopifyProductId: normalized.shopifyProductId,
            },
          },
        });

        const saved = await prisma.product.upsert({
          where: {
            storeId_shopifyProductId: {
              storeId: store.id,
              shopifyProductId: normalized.shopifyProductId,
            },
          },
          update: normalized,
          create: { ...normalized, storeId: store.id },
        });

        if (existing) await updateFiltersForProductChange(existing, saved);
        else await addProductToFilters(saved);

        break;
      }

      case "webhook-product-update": {
        const { product } = job.data;

        const oldProduct = await prisma.product.findUnique({
          where: {
            storeId_shopifyProductId: {
              shopifyProductId: product.id.toString(),
              storeId: store.id,
            },
          },
        });

        const normalized = normalizeWebhookProduct(product);

        const newProduct = await prisma.product.upsert({
          where: {
            storeId_shopifyProductId: {
              storeId: store.id,
              shopifyProductId: normalized.shopifyProductId.toString(),
            },
          },
          update: normalized,
          create: {
            ...normalized,
            storeId: store.id,
          },
        });

        if (oldProduct) {
          await updateFiltersForProductChange(oldProduct, newProduct);
        } else {
          await addProductToFilters(newProduct);
        }

        break;
      }

      case "webhook-product-delete": {
        const existing = await prisma.product.findUnique({
          where: {
            storeId_shopifyProductId: {
              storeId: store.id,
              shopifyProductId: String(job.data.productId),
            },
          },
        });

        if (!existing) break;

        await removeProductFromFilters(existing);
        await prisma.product.delete({
          where: {
            storeId_shopifyProductId: {
              storeId: store.id,
              shopifyProductId: String(job.data.productId),
            },
          },
        });

        break;
      }
    }
  },
  {
    connection: redis,
    concurrency: 5, // 🔥 IMPORTANT for scaling
  },
);

worker.on("completed", (job) => {
  console.log(`✅ Job done: ${job.name}, Job ID: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Failed: ${job.name}`, err);
});
