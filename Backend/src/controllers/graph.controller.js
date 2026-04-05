import itemModel from "../models/item.model.js";
import { queryRelatedItems } from "../services/vector.service.js";

export const getGraph = async (req, res) => {
    try {
        const items = await itemModel.find();

        const nodes = items.map((item) => ({
            id: item._id.toString(),
            label: item.content?.slice(0, 30),
            type: item.type,
            tags: item.tags, // 🔥 important
        }));

        const edgeSet = new Set();
        let edges = [];

        for (const item of items) {
            if (!item.embedding?.length) continue;

            const related = await queryRelatedItems(item.embedding);

            related.forEach((rel) => {
                if (rel.id === item._id.toString()) return;

                // 🔥 ADD THIS FILTER
                if (rel.score < 0.80) return;

                const key = [item._id.toString(), rel.id].sort().join("-");

                if (!edgeSet.has(key)) {
                    edgeSet.add(key);

                    edges.push({
                        source: item._id.toString(),
                        target: rel.id,
                        weight: rel.score,
                    });
                }
            });
        }

        res.json({ nodes, edges });

    } catch (err) {
        console.error("Graph error:", err);
        res.status(500).json({ error: "Failed to build graph" });
    }
};