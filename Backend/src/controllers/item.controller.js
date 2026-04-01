import itemModel from "../models/item.model.js";
import { addItemJob, itemQueue } from "../queue/item.queue.js";
import { uploadFile } from "../services/storage.service.js";
import { generateTags } from "../services/ai.service.js";
import { cosineSimilarity, generateEmbedding } from "../services/vector.service.js";

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

    const tags = await generateTags(req.body.content || req.body.url);

    const itemData = {
      type: req.body.type,
      content: req.body.content,
      url: req.body.url,
      fileUrl,
      tags,
    };

    if (req.body.collectionId) {
      itemData.collectionId = req.body.collectionId;
    }

    const item = await itemModel.create(itemData);

    await addItemJob(item._id);

    res.json(item);
  } catch (err) {
    console.error("❌ Upload API error:", err);
    res.status(500).json({ error: "Failed to create item" });
  }
};

// Get all items
export const getItems = async (req, res) => {
  const items = await itemModel.find().populate("collectionId");
  res.json(items);
};

// Get single item
export const getItemById = async (req, res) => {
  const item = await itemModel.findById(req.params.id).populate("collectionId");
  if (!item) return res.status(404).json({ error: "Item not found" });
  res.json(item);
};

// Update item
export const updateItem = async (req, res) => {
  try {
    const item = await itemModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Failed to update item" });
  }
};

// Delete item
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. MongoDB se delete
    const deletedItem = await itemModel.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    // 2. Redis se direct job delete 🚀
    await itemQueue.remove(id);

    res.json({ message: "Item + job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete item" });
  }
};

// Search items (semantic + keyword)
export const searchItems = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Query required" });
    }

    const queryEmbedding = await generateEmbedding(q);

    const items = await itemModel.find();

    const results = items.map(item => ({
      item,
      score: item.embedding?.length ? cosineSimilarity(queryEmbedding, item.embedding) : 0
    }));

    const sorted = results
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
};

// Related items
export const getRelatedItems = async (req, res) => {
  try {
    const { id } = req.params;

    const current = await itemModel.findById(id);
    if (!current) {
      return res.status(404).json({ error: "Item not found" });
    }

    const items = await itemModel.find({ _id: { $ne: id } });

    const related = items.map(item => ({
      item,
      score: item.embedding?.length ? cosineSimilarity(current.embedding, item.embedding) : 0
    }));

    const sorted = related
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    res.json(sorted);
  } catch (err) {
    res.status(500).json({ error: "Failed to get related items" });
  }
};

// Resurfacing
export const getResurfacedItems = async (req, res) => {
  // Example: items older than 2 months
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 2);
  const items = await itemModel.find({ createdAt: { $lte: cutoff } });
  res.json(items);
};