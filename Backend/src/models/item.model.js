import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
        type: String,
        content: String,
        url: String,
        fileUrl: String,
        tags: [String],
        embedding: [Number],
        description: String,
        thumbnail: String,
        collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "UserCollections" }
    },
    { timestamps: true }
);


itemSchema.index({ tags: 1 });
itemSchema.index({ embedding: 1 });

const itemModel = mongoose.model("Item", itemSchema);

export default itemModel;