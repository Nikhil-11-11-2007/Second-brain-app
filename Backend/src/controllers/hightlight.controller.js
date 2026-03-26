import highlightModel from "../models/highlight.model.js";


export const createHighlight = async (req, res) => {
    const data = await highlightModel.create(req.body);
    res.json(data);
};