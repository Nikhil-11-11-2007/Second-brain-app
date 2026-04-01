import "dotenv/config";
import { Worker } from "bullmq";
import redis from "../config/redis.js";
import itemModel from "../models/item.model.js";
import { generateEmbedding } from "../services/vector.service.js";
import connectDB from "../config/database.js";
import dns from "node:dns/promises";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

console.log("🚀 Starting worker...");

// ✅ Reuse DB connection
await connectDB();

const worker = new Worker(
  "itemQueue",
  async (job) => {
    console.log("⚡ Processing job:", job.id, job.data);

    try {
      const item = await itemModel.findById(job.data.itemId);

      if (!item) {
        throw new Error("Item not found in MongoDB");
      }

      const embedding = await generateEmbedding(item.content || item.url);

      item.embedding = embedding;
      await item.save();

      console.log("✅ Job completed and item updated:", job.id);
    } catch (err) {
      console.error("❌ Job error:", err);
      throw err;
    }
  },
  { connection: redis }
);

// Events
worker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`💥 Job ${job?.id} failed:`, err);
});

worker.on("error", (err) => {
  console.error("🔌 Redis error:", err);
});