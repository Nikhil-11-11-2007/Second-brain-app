import { Queue } from "bullmq";
import redis from "../config/redis.js";

export const itemQueue = new Queue("itemQueue", {
  connection: redis,
});

export const addItemJob = (itemId) => {
  return itemQueue.add(
    "processItem",
    { itemId: itemId.toString() },
    {
      jobId: itemId.toString(),
    }
  );
};