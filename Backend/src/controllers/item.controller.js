import itemModel from "../models/item.model.js";
import { addItemJob } from "../queue/item.queue.js";
import { uploadFile } from "../services/storage.service.js";
import { generateTags } from "../services/ai.service.js";

// Create Item
export const createItem = async (req, res) => {
  try {
    let fileUrl = "";

    if (req.file) {
      fileUrl = await uploadFile(req.file);
    }

    const tags = await generateTags(req.body.content || req.body.url);

    const item = await itemModel.create({
      ...req.body,
      fileUrl,
      tags,
    });

    await addItemJob(item._id);

    res.json(item); // ✅ ek hi response
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
    await itemQueue.removeJobs(id);

    res.json({ message: "Item + job deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete item" });
  }
};

// Search items (semantic + keyword)
export const searchItems = async (req, res) => {
  const { q } = req.query;
  // TODO: implement vector + text search
  res.json({ message: `Search results for ${q}` });
};

// Related items
export const getRelatedItems = async (req, res) => {
  const { id } = req.params;
  // TODO: implement embedding similarity
  res.json({ message: `Related items for ${id}` });
};

// Resurfacing
export const getResurfacedItems = async (req, res) => {
  // Example: items older than 2 months
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 2);
  const items = await itemModel.find({ createdAt: { $lte: cutoff } });
  res.json(items);
};