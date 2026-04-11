import userCollectionModel from "../models/collection.model.js"
import mongoose from "mongoose";
import itemModel from "../models/item.model.js";
import { deleteVector } from "../services/vector.service.js";

export const createCollection = async (req, res) => {

    try {
        const { name, description } = req.body

        const collection = await userCollectionModel.create({
            name,
            description,
            userId: new mongoose.Types.ObjectId(req.user.id)
        });

        res.status(201).json({
            message: "Collection created successfully",
            collection
        })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }

}

// ✅ Get All Collections
export const getCollections = async (req, res) => {
    try {
        console.log("USER FROM TOKEN:", req.user); // 🔥
        console.log("USER ID:", req.user?.id);     // 🔥

        const collections = await userCollectionModel.find({
            userId: new mongoose.Types.ObjectId(req.user.id)
        });

        console.log("FOUND COLLECTIONS:", collections); // 🔥

        res.status(200).json(collections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// ✅ Get Single Collection by ID
export const getCollectionById = async (req, res) => {
    try {
        const collection = await userCollectionModel.findOne({
            _id: req.params.id,
            userId: new mongoose.Types.ObjectId(req.user.id)
        });
        if (!collection) {
            return res.status(404).json({ error: "Collection not found" });
        }
        res.status(200).json(collection);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// ✅ Update Collection
export const updateCollection = async (req, res) => {
    try {
        const { name, description } = req.body;
        const collection = await userCollectionModel.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { returnDocument: 'after' }
        );

        if (!collection) {
            return res.status(404).json({ error: "Collection not found" });
        }

        res.status(200).json({
            message: "Collection updated successfully",
            collection,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// ✅ Delete Collection
export const deleteCollection = async (req, res) => {
    try {
        const collectionId = req.params.id;

        const collection = await userCollectionModel.findOneAndDelete({
            _id: collectionId,
            userId: new mongoose.Types.ObjectId(req.user.id)
        });

        if (!collection) {
            return res.status(404).json({ error: "Collection not found" });
        }

        // 🔥 GET ITEMS
        const items = await itemModel.find({
            collectionId,
            userId: new mongoose.Types.ObjectId(req.user.id)
        });

        // 🔥 EXTRACT IDS
        const ids = items.map(item => item._id.toString());

        // 🔥 DELETE FROM PINECONE (FASTEST)
        await deleteVector(ids);

        // 🔥 DELETE FROM DB
        await itemModel.deleteMany({
            collectionId,
            userId: new mongoose.Types.ObjectId(req.user.id)
        });

        res.status(200).json({
            message: "Collection + items + vectors deleted ✅",
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getItemsByCollection = async (req, res) => {
    try {

        const items = await itemModel.find({ collectionId: req.params.id }).populate("collectionId")

        if (!items || items.length === 0) {
            return res.status(404).json({
                error: "No items found for this collection"
            })
        }

        res.status(200).json({
            message: "Items featched successfully",
            items
        })

    } catch (err) {
        console.error("Error fetching items by collection:", err)
        res.status(500).json({
            error: "Server error"
        })
    }
}

export const getCollectionWithStats = async (req, res) => {
    try {
        const collection = await userCollectionModel.findById(req.params.id);

        const items = await itemModel.find({ collectionId: req.params.id });

        const totalItems = items.length;

        const allTags = items.flatMap(i => i.tags || []);
        const uniqueTags = [...new Set(allTags)];

        res.json({
            collection,
            totalItems,
            tags: uniqueTags,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};