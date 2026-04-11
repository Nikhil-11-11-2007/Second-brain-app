import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
}, { timestamps: true, suppressReservedKeysWarning: true });

const userCollectionModel = mongoose.model("UserCollections", collectionSchema, "user_collections");



export default userCollectionModel;