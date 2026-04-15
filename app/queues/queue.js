import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

export const productSyncQueue = new Queue("product-sync", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 500,
    removeOnFail: 1000,
  },
});
