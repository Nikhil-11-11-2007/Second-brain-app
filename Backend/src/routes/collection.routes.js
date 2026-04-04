import express from "express";
import { createCollection, getCollections, getCollectionById, updateCollection, deleteCollection, getItemsByCollection, getCollectionWithStats } from "../controllers/collection.controller.js";

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

/**
 * method: GET /api/collection/:id/items
 * desc: finding all item in one collection
 */
collectionRouter.get("/:id/items", getItemsByCollection)

/**
 * method: GET /collections/:id
 * desc: showinng all stats
 */
collectionRouter.get("/:id/stats", getCollectionWithStats)

export default collectionRouter;