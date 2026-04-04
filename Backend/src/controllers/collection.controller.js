import userCollectionModel from "../models/collection.model.js"
import itemModel from "../models/item.model.js"


export const createCollection = async (req, res) => {

    try {
        const { name, description } = req.body

        const collection = await userCollectionModel.create({ name, description })

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
        const collections = await userCollectionModel.find();
        res.status(200).json(collections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// ✅ Get Single Collection by ID
export const getCollectionById = async (req, res) => {
    try {
        const collection = await userCollectionModel.findById(req.params.id);
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
        const collection = await userCollectionModel.findByIdAndDelete(req.params.id);

        if (!collection) {
            return res.status(404).json({ error: "Collection not found" });
        }

        res.status(200).json({
            message: "Collection deleted successfully",
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

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