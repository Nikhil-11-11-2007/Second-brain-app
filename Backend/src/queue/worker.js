import { Worker } from "bullmq";
import redis from "../config/redis.js";
import Item from "../models/item.model.js";
import { generateEmbedding } from "../services/vector.service.js";

new Worker("itemQueue", async (job) => {
    const item = await Item.findById(job.data.itemId);

    const embedding = await generateEmbedding(item.content || item.url);

    item.embedding = embedding;
    await item.save();

}, { connection: redis });