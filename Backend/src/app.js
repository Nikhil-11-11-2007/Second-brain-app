import express from "express";
import cors from "cors";
import collectionRouter from "./routes/collection.routes.js";


const app = express();

// middlewares
app.use(cors());
app.use(express.json());


app.use("/api/collections", collectionRouter)

export default app;