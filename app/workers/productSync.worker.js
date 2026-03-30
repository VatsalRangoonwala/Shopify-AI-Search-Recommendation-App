import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import prisma from "../db.server.js";

const worker = new Worker(
  "product-sync",
  async job => {
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
          where: { id: product.id },
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

      case "webhook-product-create":
      case "webhook-product-update": {
        const { product } = job.data;

        await prisma.product.upsert({
          where: { id: product.id.toString() },
          update: {
            title: product.title,
            description: product.body_html,
            price: parseFloat(product.variants?.[0]?.price || 0),
            tags: product.tags?.split(",") || [],
          },
          create: {
            id: product.id.toString(),
            storeId: store.id,
            title: product.title,
            description: product.body_html,
            price: parseFloat(product.variants?.[0]?.price || 0),
            tags: product.tags?.split(",") || [],
          },
        });

        break;
      }

      case "webhook-product-delete": {
        const { productId } = job.data;

        await prisma.product.deleteMany({
          where: {
            id: productId.toString(),
            storeId: store.id,
          },
        });

        break;
      }
    }
  },
  {
    connection: redis,
    concurrency: 5, // 🔥 IMPORTANT for scaling
  }
);

worker.on("completed", job => {
  console.log(`✅ Job done: ${job.name}, Job ID: ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`❌ Failed: ${job.name}`, err);
});