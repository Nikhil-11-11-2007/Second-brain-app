import app from "./src/app.js";
import "dotenv/config"
import redis from "./src/config/redis.js";
import connectDB from "./src/config/database.js";

const PORT = process.env.PORT || 8000;

redis
connectDB()

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});