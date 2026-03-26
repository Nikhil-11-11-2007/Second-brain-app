import express from "express";
import cors from "cors";
import collectionRouter from "./routes/collection.routes.js";
import itemRouter from "./routes/item.routes.js";
import highlightRouter from "./routes/highlight.routes.js";


const app = express();

// middlewares
app.use(cors());
app.use(express.json());


app.use("/api/collections", collectionRouter)
app.use("/api/items", itemRouter)
app.use("/api/highlights", highlightRouter)

export default app;