import express from "express";
import { createCollection, getCollections, getCollectionById, updateCollection, deleteCollection, getItemsByCollection, getCollectionWithStats } from "../controllers/collection.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const collectionRouter = express.Router();

// method: POST /api/collections/
// desc: create a collection
collectionRouter.post("/", auth, createCollection);

// methood: GET /api/collections/
// desc: featching all collections
collectionRouter.get("/", auth, getCollections)

// method: GET /api/collections/:id
// desc: finding one collection between collections
collectionRouter.get("/:id", auth, getCollectionById)

// method: PUT/api/collections/:id
// desc: updating a collection
collectionRouter.put("/:id", auth, updateCollection)

// method: DELETE /api/collections/:id
// decs: deleating a collection
collectionRouter.delete("/:id", auth, deleteCollection)

/**
 * method: GET /api/collection/:id/items
 * desc: finding all item in one collection
 */
collectionRouter.get("/:id/items", auth, getItemsByCollection)

/**
 * method: GET /collections/:id
 * desc: showinng all stats
 */
collectionRouter.get("/:id/stats", auth, getCollectionWithStats)

export default collectionRouter;