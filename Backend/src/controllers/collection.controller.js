import userCollectionModel from "../models/collection.model.js"


export async function createCollection(req, res) {

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
export async function getCollections(req, res) {
    try {
        const collections = await userCollectionModel.find();
        res.status(200).json(collections);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

// ✅ Get Single Collection by ID
export async function getCollectionById(req, res) {
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
export async function updateCollection(req, res) {
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
export async function deleteCollection(req, res) {
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