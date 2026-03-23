import express from "express";
import cors from "cors";
import collectionRouter from "./routes/collection.routes.js";
import itemRouter from "./routes/item.routes.js";


const app = express();

// middlewares
app.use(cors());
app.use(express.json());


app.use("/api/collections", collectionRouter)
app.use("/api/upload", itemRouter)

export default app;