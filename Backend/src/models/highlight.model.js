import mongoose from "mongoose";

const highlightSchema = new mongoose.Schema(
    {
        // ✅ consistent naam use karo (itemId)
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true,
        },

        text: {
            type: String,
            required: true,
        },

        // 🔥 AI fields
        tags: [
            {
                type: String,
            },
        ],

        description: {
            type: String,
        },
    },
    {
        timestamps: true, // 🔥 createdAt, updatedAt
    }
);

const highlightModel = mongoose.model("Highlight", highlightSchema);

export default highlightModel;
