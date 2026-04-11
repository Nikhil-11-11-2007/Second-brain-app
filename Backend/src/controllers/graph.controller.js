import itemModel from "../models/item.model.js";
import { queryRelatedItems } from "../services/vector.service.js";
import mongoose from "mongoose";

export const getGraph = async (req, res) => {
    try {
        const items = await itemModel.find({
            userId: new mongoose.Types.ObjectId(req.user.id)
        }).limit(50);

        const nodes = items.map((item) => ({
            id: item._id.toString(),
            label: item.content?.slice(0, 30) || "No Title",
            type: item.type,
            tags: item.tags,
        }));

        const edgeSet = new Set();
        let edges = [];

        // 🔥 PARALLEL CALLS
        const relatedResults = await Promise.all(
            items.map(async (item) => {
                if (!item.embedding?.length) return [];

                const related = await queryRelatedItems(
                    item.embedding,
                    req.user.id
                );

                return { item, related };
            })
        );

        for (const { item, related } of relatedResults) {
            if (!related) continue;

            for (const rel of related) {
                if (rel.id === item._id.toString()) continue;
                if (rel.score < 0.80) continue;

                const key = [item._id.toString(), rel.id].sort().join("-");

                if (!edgeSet.has(key)) {
                    edgeSet.add(key);

                    edges.push({
                        source: item._id.toString(),
                        target: rel.id,
                        weight: rel.score,
                    });

                    // 🔥 STOP WHEN TOO MANY EDGES
                    if (edges.length > 200) break;
                }
            }

            if (edges.length > 200) break;
        }

        res.json({ nodes, edges });

    } catch (err) {
        console.error("Graph error:", err);
        res.status(500).json({ error: "Failed to build graph" });
    }
};