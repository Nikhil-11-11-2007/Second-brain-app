import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    }
}, { timestamps: true });

const CollectionModel = mongoose.model("Collection", collectionSchema)

export default CollectionModel;