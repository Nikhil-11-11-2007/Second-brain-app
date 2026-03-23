import itemModel from "../models/item.model.js";
import { addItemJob } from "../queue/item.queue.js";
import { uploadFile } from "../services/storage.service.js";
import { generateTags } from "../services/ai.service.js";

export const createItem = async (req, res) => {
    let fileUrl = "";

    if (req.file) {
        fileUrl = await uploadFile(req.file);
    }

    const tags = await generateTags(req.body.content || req.body.url);

    const item = await itemModel.create({
        ...req.body,
        fileUrl,
        tags
    });

    await addItemJob(item._id);

    res.json(item);
};

export const getItems = async (req, res) => {
    const items = await itemModel.find().populate("collectionId");
    res.json(items);
};