import mongoose from "mongoose";

const highlightSchema = new mongoose.Schema(
    {
        itemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            required: true,
        },

        text: {
            type: String,
            required: true,
        },

        tags: [String],
        description: String,

        // 🔥 ADD THIS
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    { timestamps: true }
);

const highlightModel = mongoose.model("Highlight", highlightSchema);

export default highlightModel;