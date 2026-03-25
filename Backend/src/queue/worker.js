import "dotenv/config";
import mongoose from "mongoose";
import { Worker } from "bullmq";
import redis from "../config/redis.js";
import itemModel from "../models/item.model.js";
import { generateEmbedding } from "../services/vector.service.js";
import dns from "node:dns/promises";

dns.setServers(["1.1.1.1", "8.8.8.8"]);

// ✅ MongoDB connect (no deprecated options)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected in worker"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

console.log("🚀 Starting worker...");

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
      throw err; // BullMQ will mark job as failed
    }
  },
  { connection: redis }
);

// Worker event listeners
worker.on("completed", (job) => {
  console.log(`🎉 Job ${job.id} marked as completed`);
});

worker.on("failed", (job, err) => {
  console.error(`💥 Job ${job.id} failed:`, err);
});

worker.on("error", (err) => {
  console.error("🔌 Redis connection error:", err);
});
