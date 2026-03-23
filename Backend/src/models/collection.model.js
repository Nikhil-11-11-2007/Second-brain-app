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
}, { timestamps: true, suppressReservedKeysWarning: true });

const userCollectionModel = mongoose.model("UserCollections", collectionSchema, "user_collections");



export default userCollectionModel;