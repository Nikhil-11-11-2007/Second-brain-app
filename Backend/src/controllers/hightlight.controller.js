import highlightModel from "../models/highlight.model.js";
import { generateTagsAndDescription } from "../services/ai.service.js";

export const createHighlight = async (req, res) => {
  try {
    const { text, itemId } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    // 🔥 AI processing
    const aiData = await generateTagsAndDescription(text);

    const data = await highlightModel.create({
      text,
      itemId,
      tags: aiData.tags,
      description: aiData.description,
    });

    res.json(data);

  } catch (err) {
    console.error("Highlight error:", err);
    res.status(500).json({ error: "Failed to create highlight" });
  }
};