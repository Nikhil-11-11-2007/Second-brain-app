import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
        type: String,
        content: String,
        url: String,
        fileUrl: String,
        tags: [String],
        embedding: [Number],
        collection: { type: mongoose.Schema.Types.ObjectId, ref: "Collection" }
    },
    { timestamps: true }
);


itemSchema.index({ tags: 1 });  
itemSchema.index({ embedding: 1 });

const itemModel =  mongoose.model("Item", itemSchema);

export default itemModel;