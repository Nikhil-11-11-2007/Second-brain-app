import express from "express";
import { getGraph } from "../controllers/graph.controller.js";

const graphRouter = express.Router();

graphRouter.get("/", getGraph);

export default graphRouter;