import mongoose from "mongoose";

const highlightSchema = new mongoose.Schema({
    item: {
        ref: "Item",
        type: mongoose.Schema.Types.ObjectId,
    },
    text: String
});

const highlightModel = mongoose.model("Highlight", highlightSchema)

export default highlightModel;
