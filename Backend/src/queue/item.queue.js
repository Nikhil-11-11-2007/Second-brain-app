import { Queue } from "bullmq";
import redis from "../config/redis.js";

export const itemQueue = new Queue("itemQueue", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: true,
  },
});

export const addItemJob = (itemId) => {
  return itemQueue.add(
    "processItem",
    { itemId: itemId.toString() },
    {
      jobId: itemId.toString(),
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    }
  );
};