import express from "express";
import multer from "multer";
import { createItem, deleteItem, getItemById, getItems, getRelatedItems, getResurfacedItems, searchItems, updateItem } from "../controllers/item.controller.js";

const upload = multer();
const itemRouter = express.Router();

itemRouter.post("/", upload.single("file"), createItem);
itemRouter.get("/", getItems);
itemRouter.get("/:id", getItemById)
itemRouter.put("/:id", updateItem)
itemRouter.delete("/:id", deleteItem)

// Advance features

itemRouter.get("/search", searchItems)
itemRouter.get("/:id/related", getRelatedItems)
itemRouter.get("/resurface", getResurfacedItems)


export default itemRouter;