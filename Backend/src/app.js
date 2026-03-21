import express from "express";
import cors from "cors";
import connectDB from "./config/database.js";
import redis from "./config/redis.js";


// import authRoutes from "./routes/auth.routes.js";
// import itemRoutes from "./routes/item.routes.js";

const app = express();
redis
connectDB()

app.use(cors());
app.use(express.json());


// app.use("/api/auth", authRoutes);
// app.use("/api/items", itemRoutes);

export default app;