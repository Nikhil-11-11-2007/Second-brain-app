import express from "express";
import multer from "multer";
import { createItem, deleteItem, getItemById, getItems, getRelatedItems, getResurfacedItems, searchItems, updateItem } from "../controllers/item.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const upload = multer();
const itemRouter = express.Router();


itemRouter.post("/", auth, upload.single("file"), createItem);

// Advance features
itemRouter.get("/search", auth, searchItems)
itemRouter.get("/:id/related", auth, getRelatedItems)
itemRouter.get("/resurface",auth, getResurfacedItems)

itemRouter.get("/", auth, getItems);
itemRouter.get("/:id", auth, getItemById)
itemRouter.put("/:id", auth, updateItem)
itemRouter.delete("/:id", auth, deleteItem)

export default itemRouter;