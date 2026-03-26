import express from "express"
import { createHighlight } from "../controllers/hightlight.controller.js"

const highlightRouter = express.Router()

highlightRouter.post("/", createHighlight)

export default highlightRouter