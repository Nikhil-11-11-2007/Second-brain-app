import express from "express"
import { createHighlight } from "../controllers/hightlight.controller.js"
import { auth } from "../middlewares/auth.middleware.js"

const highlightRouter = express.Router()

highlightRouter.post("/", auth, createHighlight)

export default highlightRouter