import itemModel from "../models/item.model.js";
import mongoose from "mongoose";
import { addItemJob, itemQueue } from "../queue/item.queue.js";
import { uploadFile } from "../services/storage.service.js";
import { generateTagsAndDescription } from "../services/ai.service.js";
import { generateEmbedding, queryRelatedItems, deleteVector } from "../services/vector.service.js";
import { Job } from "bullmq";
import userCollectionModel from "../models/collection.model.js";

// Create Item
export const createItem = async (req, res) => {
  try {
    let fileUrl = "";

    if (!req.body.type) {
      return res.status(400).json({ error: "Type is required" });
    }

    if (req.file) {
      fileUrl = await uploadFile(req.file);
    }

    const baseText = `
                    Title: ${req.body.content || ""}
                    URL: ${req.body.url || ""}
                  `;

    const aiData = await generateTagsAndDescription(baseText);

    const itemData = {
      type: req.body.type,
      content: req.body.content,
      url: req.body.url,
      fileUrl,
      thumbnail: req.body.thumbnail || "",
      tags: aiData.tags,
      description: aiData.description,
      userId: new mongoose.Types.ObjectId(req.user.id)
    };

    if (req.body.collectionId) {
      itemData.collectionId = req.body.collectionId;
    }

    const item = await itemModel.create(itemData);

    await addItemJob(item._id);

    if (item.collectionId) {
      const collection = await userCollectionModel.findById(item.collectionId);

      if (collection) {
        collection.tags = [
          ...new Set([
            ...(collection.tags || []),
            ...(item.tags || [])
          ])
        ];

        await collection.save();
      }
    }

    res.status(201).json(item);

  } catch (err) {
    console.error("❌ Create Item error:", err);
    res.status(500).json({ error: "Failed to create item" });
  }
};

// Get all items
export const getItems = async (req, res) => {
  try {
    const items = await itemModel.find({
      userId: new mongoose.Types.ObjectId(req.user.id)
    }).populate("collectionId");
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch items" });
  }
};

// Get single item
export const getItemById = async (req, res) => {
  try {
    const item = await itemModel.findOne({
      _id: req.params.id,
      userId: new mongoose.Types.ObjectId(req.user.id)
    }).populate("collectionId")

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch item" });
  }
};

// Update item
export const updateItem = async (req, res) => {
  try {
    const item = await itemModel.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: new mongoose.Types.ObjectId(req.user.id)
      },
      req.body,
      { new: true }
    );

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to update item" });
  }
};

// Delete item
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedItem = await itemModel.findOneAndDelete({
      _id: id,
      userId: new mongoose.Types.ObjectId(req.user.id)
    });

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    const job = await Job.fromId(itemQueue, id);
    if (job) {
      await job.remove();
    }

    await deleteVector(id);

    res.json({ message: "Item + job + vector deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete item" });
  }
};

// Search items (semantic search via Pinecone)
export const searchItems = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Query required" });
    }

    const queryEmbedding = await generateEmbedding(`query: ${q}`);

    const matches = await queryRelatedItems(
      queryEmbedding,
      req.user.id
    );

    const results = matches.map((m) => ({
      id: m.id,
      score: m.score,
      ...m.metadata,
    }));

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
};

// Related items
export const getRelatedItems = async (req, res) => {
  try {
    const { id } = req.params;

    const current = await itemModel.findOne({
      _id: id,
      userId: new mongoose.Types.ObjectId(req.user.id)
    });

    if (!current || !current.embedding?.length) {
      return res.status(404).json({
        error: "Item not found or embedding missing",
      });
    }

    const matches = await queryRelatedItems(
      current.embedding,
      req.user.id
    );

    const filtered = matches.filter((m) => m.id !== id);

    const results = filtered.map((m) => ({
      id: m.id,
      score: m.score,
      ...m.metadata,
    }));

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get related items" });
  }
};

// Resurfacing (old items)
export const getResurfacedItems = async (req, res) => {
  try {
    const cutoff = new Date();
    cutoff.setMinutes(cutoff.getMinutes() - 2);

    const items = await itemModel.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          createdAt: { $lte: cutoff }
        },
      },
      { $sample: { size: 10 } }
    ]);

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch resurfaced items" });
  }
};