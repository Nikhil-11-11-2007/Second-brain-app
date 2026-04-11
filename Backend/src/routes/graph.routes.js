import express from "express";
import { getGraph } from "../controllers/graph.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const graphRouter = express.Router();

graphRouter.get("/", auth, getGraph);

export default graphRouter;