import express from "express";
import { createCollection, getCollections, getCollectionById, updateCollection, deleteCollection } from "../controllers/collection.controller.js";

const collectionRouter = express.Router();

// method: POST /api/collections/
// desc: create a collection
collectionRouter.post("/", createCollection);

// methood: GET /api/collections/
// desc: featching all collections
collectionRouter.get("/", getCollections)

// method: GET /api/collections/:id
// desc: finding one collection between collections
collectionRouter.get("/:id", getCollectionById)

// method: PUT/api/collections/:id
// desc: updating a collection
collectionRouter.put("/:id", updateCollection)

// method: DELETE /api/collections/:id
// decs: deleating a collection
collectionRouter.delete("/:id", deleteCollection)

export default collectionRouter;