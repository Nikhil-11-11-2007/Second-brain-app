import "dotenv/config";
import { Worker } from "bullmq";
import redis from "../config/redis.js";
import itemModel from "../models/item.model.js";
import connectDB from "../config/database.js";
import { setupDNS } from "../config/network.js";
import { generateEmbedding, saveToPinecone } from "../services/vector.service.js";

setupDNS();

console.log("🚀 Starting worker...");

await connectDB();

const worker = new Worker(
  "itemQueue",
  async (job) => {
    console.log("⚡ Processing job:", job.id, job.data);

    try {
      const item = await itemModel.findById(job.data.itemId);
      if (!item) throw new Error("Item not found in MongoDB");

      let text = "";

      if (item.type === "video") {
        text = `
    Video Title: ${item.content}
    URL: ${item.url}
    Tags: ${(item.tags || []).join(", ")}
  `;
      }

      else if (item.type === "article") {
        text = `
    Article: ${item.content}
    URL: ${item.url}
    Tags: ${(item.tags || []).join(", ")}
  `;
      }

      else if (item.type === "image") {
        text = `
    Image description: ${item.content || "No description"}
    Tags: ${(item.tags || []).join(", ")}
  `;
      }

      else if (item.type === "pdf") {
        text = `
    PDF Title: ${item.content}
    Tags: ${(item.tags || []).join(", ")}
  `;
      }

      else if (item.type === "product") {
        text = `
    Product: ${item.content}
    Description: ${item.description || ""}
    Tags: ${(item.tags || []).join(", ")}
  `;
      }

      // fallback
      if (!text.trim()) {
        text = `${item.content || "No content"} ${(item.tags || []).join(", ")}`;
      }

      // clean
      text = text.replace(/\s+/g, " ").trim();

      const embedding = await generateEmbedding(text);

      if (!embedding || embedding.length !== 384) {
        console.log("❌ Invalid embedding, skipping");
        return;
      }

      item.embedding = embedding;
      await item.save();

      await saveToPinecone(item._id.toString(), embedding, {
        type: item.type,
        content: item.content,
        url: item.url,
        tags: item.tags,
        description: item.description,
        userId: item.userId.toString()
      });

      console.log("Job completed:", job.id);
    } catch (err) {
      console.error("Job error:", err.message);
      throw err;
    }
  },
  { connection: redis, concurrency: 5 }
);


worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("Worker error:", err.message);
});

process.on("SIGINT", async () => {
  console.log("Shutting down worker...");
  await worker.close();
  process.exit(0);
});