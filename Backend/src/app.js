import express from "express";
import { setupDNS } from "./config/network.js";
import cors from "cors";
import collectionRouter from "./routes/collection.routes.js";
import itemRouter from "./routes/item.routes.js";
import highlightRouter from "./routes/highlight.routes.js";
import graphRouter from "./routes/graph.routes.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";



setupDNS();
const app = express();
app.use(cookieParser());

// middlewares
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());


app.use("/api/collections", collectionRouter)
app.use("/api/items", itemRouter)
app.use("/api/highlights", highlightRouter)
app.use("/api/graph", graphRouter)
app.use("/api/auth", authRouter);

export default app;