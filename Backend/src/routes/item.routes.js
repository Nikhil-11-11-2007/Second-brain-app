import express from "express";
import multer from "multer";
import { createItem, getItems } from "../controllers/item.controller.js";

const upload = multer();

const itemRouter = express.Router();

itemRouter.post("/", upload.single("file"), createItem);
itemRouter.get("/", getItems);

export default itemRouter;